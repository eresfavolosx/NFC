/**
 * Escapes specific characters in HTML to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes a URL to ensure it is safe to use in an href attribute.
 * Only allows http, https, and mailto protocols.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL.
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') return '#';
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
    // Allow relative URLs if needed, but for now strict external links seem safer based on context
    // If the app uses internal navigation via hash or relative paths, this might need adjustment.
    // Given the app is a link manager, external links are primary.
    return '#';
  } catch (e) {
    return '#';
  }
}
