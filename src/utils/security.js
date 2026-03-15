/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Security Utilities
   ═══════════════════════════════════════════════════════════ */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

/**
 * Validates if a URL is safe to be used in href.
 * Currently checks if it starts with http:// or https://
 * @param {string} url - The URL to validate.
 * @returns {boolean} True if valid.
 */
export function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
