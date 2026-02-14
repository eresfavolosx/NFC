## 2026-02-14 - Stored XSS in Views
**Vulnerability:** User input (link titles, URLs, tag labels) was directly interpolated into HTML template literals and rendered via `innerHTML`.
**Learning:** This vanilla JS architecture relies heavily on `innerHTML` for rendering views, making it prone to XSS if manual sanitization is missed.
**Prevention:** Always use `escapeHTML` (from `src/utils/sanitize.js`) when rendering user-controlled data into HTML. For URLs in `href`, use `sanitizeUrl`.
