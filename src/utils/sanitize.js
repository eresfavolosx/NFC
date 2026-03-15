
/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Security Utilities
   ═══════════════════════════════════════════════════════════ */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes a URL to prevent javascript: execution and HTML injection.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL.
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();

  // Block javascript: protocol
  if (trimmed.toLowerCase().startsWith('javascript:')) {
    return 'about:blank';
  }

  return escapeHTML(trimmed);
}
