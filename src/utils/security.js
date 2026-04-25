import { escapeHTML } from './sanitize.js';
export { escapeHTML };

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
