export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (match) => {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return chars[match];
  });
}

export function sanitizeURL(url) {
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // invalid url
  }
  return '';
}
