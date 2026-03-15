## 2024-05-23 - Template Literal XSS
**Vulnerability:** Widespread Stored XSS due to unsafe use of template literals in `innerHTML` assignments across all views (`links.js`, `tags.js`, `dashboard.js`, `toast.js`).
**Learning:** The Vanilla JS architecture heavily relies on constructing HTML strings with user input directly interpolated.
**Prevention:** Always use `escapeHTML` from `src/utils/sanitize.js` when interpolating user data into HTML strings. For URLs in attributes, use `isValidUrl` to prevent `javascript:` protocol.
