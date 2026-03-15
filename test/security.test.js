import { escapeHTML, sanitizeURL } from '../src/utils/security.js';
import assert from 'assert';

console.log('Testing security utils...');

// Test escapeHTML
assert.strictEqual(escapeHTML('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;', 'Should escape script tags');
assert.strictEqual(escapeHTML('"quote"'), '&quot;quote&quot;', 'Should escape double quotes');
assert.strictEqual(escapeHTML("'single'"), '&#039;single&#039;', 'Should escape single quotes');
assert.strictEqual(escapeHTML('&'), '&amp;', 'Should escape ampersand');
assert.strictEqual(escapeHTML(null), null, 'Should handle null');
assert.strictEqual(escapeHTML(undefined), undefined, 'Should handle undefined');
assert.strictEqual(escapeHTML(123), 123, 'Should handle numbers');

// Test sanitizeURL
assert.strictEqual(sanitizeURL('https://example.com'), 'https://example.com', 'Should allow https');
assert.strictEqual(sanitizeURL('http://example.com'), 'http://example.com', 'Should allow http');
assert.strictEqual(sanitizeURL('mailto:test@example.com'), 'mailto:test@example.com', 'Should allow mailto');
assert.strictEqual(sanitizeURL('javascript:alert(1)'), '#', 'Should block javascript:');
assert.strictEqual(sanitizeURL('data:text/html,base64...'), '#', 'Should block data:');
assert.strictEqual(sanitizeURL('vbscript:alert(1)'), '#', 'Should block vbscript:');
assert.strictEqual(sanitizeURL('/relative/path'), '#', 'Should block relative paths (as per current implementation)');
assert.strictEqual(sanitizeURL(''), '#', 'Should handle empty string');
assert.strictEqual(sanitizeURL(null), '#', 'Should handle null');

console.log('All security tests passed!');
