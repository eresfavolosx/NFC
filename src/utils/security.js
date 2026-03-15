/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes a URL to prevent javascript: protocol attacks.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL or '#' if invalid.
 */
export function sanitizeURL(url) {
  if (!url) return '';
  // Allow relative URLs starting with / or . or just path characters
  if (/^[\w\-\.\/]+$/.test(url)) return url;

  try {
    const parsed = new URL(url, window.location.origin); // Use base for relative URLs
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // invalid url
  }
  return '#';
}
