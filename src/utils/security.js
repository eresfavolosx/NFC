/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (match) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[match];
  });
}

/**
 * Sanitizes a URL to ensure it uses a safe protocol.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL or '#' if invalid.
 */
export function sanitizeURL(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // invalid URL
  }
  return '#';
}
