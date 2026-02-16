import { escapeHTML, sanitizeURL } from '../src/utils/security.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('Running Security Utils Tests...');

// Test escapeHTML
assert(escapeHTML('<script>') === '&lt;script&gt;', 'escapeHTML should escape < and >');
assert(escapeHTML('"quote"') === '&quot;quote&quot;', 'escapeHTML should escape double quotes');
assert(escapeHTML("'quote'") === '&#039;quote&#039;', 'escapeHTML should escape single quotes');
assert(escapeHTML('&') === '&amp;', 'escapeHTML should escape ampersand');
assert(escapeHTML(null) === '', 'escapeHTML should handle null');
assert(escapeHTML(undefined) === '', 'escapeHTML should handle undefined');
assert(escapeHTML(123) === '123', 'escapeHTML should handle numbers');

// Test sanitizeURL
assert(sanitizeURL('https://example.com') === 'https://example.com', 'sanitizeURL should allow https');
assert(sanitizeURL('http://example.com') === 'http://example.com', 'sanitizeURL should allow http');
assert(sanitizeURL('javascript:alert(1)') === 'about:blank', 'sanitizeURL should block javascript:');
assert(sanitizeURL('JAVASCRIPT:alert(1)') === 'about:blank', 'sanitizeURL should block JAVASCRIPT: (case insensitive)');
assert(sanitizeURL('  javascript:alert(1)') === 'about:blank', 'sanitizeURL should block javascript: with leading whitespace');
assert(sanitizeURL('https://example.com?q="><script>') === 'https://example.com?q=&quot;&gt;&lt;script&gt;', 'sanitizeURL should escape characters in URL');

console.log('All tests passed!');
