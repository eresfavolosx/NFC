import { test } from 'node:test';
import assert from 'node:assert';
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
  buildOtpAuthUri
} from '../src/utils/totp.js';

const RFC6238_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // Base32("12345678901234567890")

test('TOTP Engine (RFC 6238)', async (t) => {
  await t.test('generateTotpSecret returns a 32-char valid Base32 secret', () => {
    const secret = generateTotpSecret();
    assert.strictEqual(secret.length, 32);
    assert.match(secret, /^[A-Z2-7]{32}$/);
  });

  await t.test('generateTotpSecret and generateBackupCodes fail closed without crypto.getRandomValues', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true
    });
    try {
      assert.throws(() => generateTotpSecret(), /getRandomValues/i);
      assert.throws(() => generateBackupCodes(), /getRandomValues/i);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
        writable: true
      });
    }
  });

  await t.test('generateTotpCode matches RFC 6238 SHA-1 test vector at T=59s', async () => {
    const code = await generateTotpCode(RFC6238_SECRET, 59_000);
    assert.strictEqual(code, '287082');
  });

  await t.test('verifyTotpCode accepts current step and adjacent clock-drift steps', async () => {
    const currentValid = await verifyTotpCode(RFC6238_SECRET, '287082', 1, 59_000);
    const prevWindowValid = await verifyTotpCode(RFC6238_SECRET, '287082', 1, 89_000);
    const farWindowInvalid = await verifyTotpCode(RFC6238_SECRET, '287082', 1, 150_000);
    const wrongCodeInvalid = await verifyTotpCode(RFC6238_SECRET, '000000', 1, 59_000);

    assert.strictEqual(currentValid, true);
    assert.strictEqual(prevWindowValid, true);
    assert.strictEqual(farWindowInvalid, false);
    assert.strictEqual(wrongCodeInvalid, false);
  });

  await t.test('generateBackupCodes generates 8 formatted single-use recovery codes', () => {
    const codes = generateBackupCodes(8);
    assert.strictEqual(codes.length, 8);
    for (const c of codes) {
      assert.match(c, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });

  await t.test('verifyAndConsumeBackupCode validates case/hyphen-insensitively and consumes code once', () => {
    const initial = ['ABCD-1234', 'EFGH-5678'];
    const lower = initial[0].toLowerCase().replace('-', '');
    const res1 = verifyAndConsumeBackupCode(lower, initial);
    assert.strictEqual(res1.valid, true);
    assert.deepStrictEqual(res1.remainingCodes, ['EFGH-5678']);

    const res2 = verifyAndConsumeBackupCode(initial[0], res1.remainingCodes);
    assert.strictEqual(res2.valid, false);
    assert.deepStrictEqual(res2.remainingCodes, ['EFGH-5678']);
  });

  await t.test('buildOtpAuthUri produces a valid otpauth:// URI and handles null email/issuer safely', () => {
    const uri = buildOtpAuthUri(RFC6238_SECRET, 'user@tocaito.com', 'Tocaito');
    assert.ok(uri.startsWith('otpauth://totp/Tocaito:user%40tocaito.com?'));
    assert.ok(uri.includes(`secret=${RFC6238_SECRET}`));
    assert.ok(uri.includes('issuer=Tocaito'));
    assert.ok(uri.includes('digits=6'));
    assert.ok(uri.includes('period=30'));

    const fallbackUri = buildOtpAuthUri(RFC6238_SECRET, null, null);
    assert.ok(fallbackUri.startsWith('otpauth://totp/Tocaito:user?'));
    assert.ok(fallbackUri.includes('issuer=Tocaito'));
  });
});
