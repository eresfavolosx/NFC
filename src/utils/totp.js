/**
 * Free RFC 6238 TOTP (Time-Based One-Time Password) Engine for Tocaito / NFC Tag Manager
 * 100% Free ($0 forever) — Zero SMS costs or external paid identity tiers.
 * Fully compatible with Google Authenticator, Apple Passwords, Microsoft Authenticator, Authy, and 1Password.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SESSION_2FA_KEY = 'nfc_2fa_session_verified';

function getSecureRandomBytes(length) {
    if (typeof globalThis === 'undefined' || !globalThis.crypto?.getRandomValues) {
        throw new Error('Cryptographically secure random generator (crypto.getRandomValues) is unavailable.');
    }
    const random = new Uint8Array(length);
    globalThis.crypto.getRandomValues(random);
    return random;
}

/**
 * Generate a cryptographically secure Base32 secret (32 chars = 160 bits).
 */
export function generateTotpSecret(length = 32) {
    const random = getSecureRandomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) {
        out += BASE32_ALPHABET[random[i] % BASE32_ALPHABET.length];
    }
    return out;
}

/**
 * Decode an RFC 4648 Base32 secret into raw bytes.
 */
export function base32ToBytes(secret = '') {
    const clean = String(secret ?? '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    const bytes = [];
    let bits = 0;
    let value = 0;

    for (let i = 0; i < clean.length; i++) {
        const idx = BASE32_ALPHABET.indexOf(clean[i]);
        if (idx === -1) continue;
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return new Uint8Array(bytes);
}

/**
 * Generate a 6-digit RFC 6238 TOTP code using Web Crypto HMAC-SHA1.
 */
export async function generateTotpCode(secret, timestampMs = Date.now()) {
    const keyBytes = base32ToBytes(secret);
    if (keyBytes.length === 0) {
        throw new Error('Invalid TOTP secret');
    }

    const step = Math.floor(timestampMs / 1000 / 30);
    const counter = new Uint8Array(8);
    let tmp = step;
    for (let i = 7; i >= 0; i--) {
        counter[i] = tmp & 0xff;
        tmp = Math.floor(tmp / 256);
    }

    const key = await globalThis.crypto.subtle.importKey(
        'raw',
        keyBytes.slice(),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    const signature = await globalThis.crypto.subtle.sign('HMAC', key, counter);
    const hmac = new Uint8Array(signature);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    return String(binary % 1_000_000).padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code across [-windowSteps, +windowSteps] 30-second steps.
 */
export async function verifyTotpCode(secret, inputCode, windowSteps = 1, timestampMs = Date.now()) {
    if (!secret || !inputCode) return false;
    const clean = String(inputCode).replace(/\D/g, '');
    if (!/^\d{6}$/.test(clean) || base32ToBytes(secret).length === 0) {
        return false;
    }

    for (let stepOffset = -windowSteps; stepOffset <= windowSteps; stepOffset++) {
        try {
            const candidate = await generateTotpCode(secret, timestampMs + stepOffset * 30_000);
            if (candidate === clean) {
                return true;
            }
        } catch {
            // Ignore individual step failure
        }
    }
    return false;
}

/**
 * Generate 8 emergency backup codes.
 */
export function generateBackupCodes(count = 8) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codes = [];
    const random = getSecureRandomBytes(count * 8);

    for (let i = 0; i < count; i++) {
        let part1 = '';
        let part2 = '';
        for (let j = 0; j < 4; j++) {
            part1 += alphabet[random[i * 8 + j] % alphabet.length];
            part2 += alphabet[random[i * 8 + j + 4] % alphabet.length];
        }
        codes.push(`${part1}-${part2}`);
    }
    return codes;
}

/**
 * Verify and consume a backup code.
 */
export function verifyAndConsumeBackupCode(inputCode, availableCodes = []) {
    if (!inputCode || !Array.isArray(availableCodes) || availableCodes.length === 0) {
        return { valid: false, remainingCodes: availableCodes };
    }
    const cleanInput = String(inputCode).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const foundIndex = availableCodes.findIndex(code => {
        const cleanSaved = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
        return cleanSaved === cleanInput;
    });

    if (foundIndex === -1) {
        return { valid: false, remainingCodes: availableCodes };
    }

    const remainingCodes = [...availableCodes];
    remainingCodes.splice(foundIndex, 1);
    return { valid: true, remainingCodes };
}

/**
 * Build standard otpauth:// URI for Authenticator Apps.
 */
export function buildOtpAuthUri(secret, accountEmail = 'user', issuer = 'Tocaito') {
    const cleanSecret = String(secret ?? '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    const cleanIssuer = String(issuer ?? '').trim() || 'Tocaito';
    const cleanAccount = String(accountEmail ?? '').trim() || 'user';
    const label = `${encodeURIComponent(cleanIssuer)}:${encodeURIComponent(cleanAccount)}`;
    const params = new URLSearchParams({
        secret: cleanSecret,
        issuer: cleanIssuer,
        algorithm: 'SHA1',
        digits: '6',
        period: '30',
    });
    return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Return seconds remaining in the current 30-second TOTP cycle (1..30).
 */
export function getTotpSecondsRemaining(timestampMs = Date.now()) {
    const elapsed = Math.floor(timestampMs / 1000) % 30;
    return 30 - elapsed;
}

function getSessionKey(uid) {
    return uid ? `${SESSION_2FA_KEY}:${uid}` : SESSION_2FA_KEY;
}

export function isSession2FAVerified(uid = null) {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    try {
        return window.sessionStorage.getItem(getSessionKey(uid)) === 'true';
    } catch {
        return false;
    }
}

export function markSession2FAVerified(uid = null) {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
        window.sessionStorage.setItem(getSessionKey(uid), 'true');
    } catch {}
}

export function clearSession2FAVerification(uid = null) {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
        if (uid) {
            window.sessionStorage.removeItem(getSessionKey(uid));
        } else {
            for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
                const key = window.sessionStorage.key(i);
                if (key === SESSION_2FA_KEY || key?.startsWith(`${SESSION_2FA_KEY}:`)) {
                    window.sessionStorage.removeItem(key);
                }
            }
        }
    } catch {}
}
