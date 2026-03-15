import { test } from 'node:test';
import assert from 'node:assert';
import { escapeHTML, isValidURL } from '../src/utils/security.js';

test('escapeHTML', async (t) => {
  await t.test('should escape basic HTML characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    assert.strictEqual(escapeHTML(input), expected);
  });

  await t.test('should escape single quotes', () => {
    const input = "It's cool";
    const expected = "It&#39;s cool";
    assert.strictEqual(escapeHTML(input), expected);
  });

  await t.test('should escape ampersands', () => {
    const input = 'A & B';
    const expected = 'A &amp; B';
    assert.strictEqual(escapeHTML(input), expected);
  });

  await t.test('should handle null or undefined', () => {
    assert.strictEqual(escapeHTML(null), '');
    assert.strictEqual(escapeHTML(undefined), '');
  });

  await t.test('should handle numbers', () => {
    assert.strictEqual(escapeHTML(123), '123');
  });
});

test('isValidURL', async (t) => {
  await t.test('should return true for valid http/https URLs', () => {
    assert.strictEqual(isValidURL('https://example.com'), true);
    assert.strictEqual(isValidURL('http://example.com'), true);
  });

  await t.test('should return false for javascript protocol', () => {
    assert.strictEqual(isValidURL('javascript:alert(1)'), false);
  });

  await t.test('should return false for invalid URLs', () => {
    assert.strictEqual(isValidURL('not a url'), false);
  });
});
