/* ═══════════════════════════════════════════════════════════
   Security Utilities
   ═══════════════════════════════════════════════════════════ */

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

/**
 * Sanitizes a URL to ensure it's safe for use in href attributes.
 * Prevents javascript: protocol execution.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL.
 */
export function sanitizeURL(url) {
  if (!url) return '';

  // Check for javascript: protocol
  // This regex handles various forms of "javascript:" with whitespace/casing
  if (/^\s*javascript:/i.test(url)) {
    return 'about:blank';
  }

  // Also escape the URL to prevent attribute injection
  return escapeHTML(url);
}
