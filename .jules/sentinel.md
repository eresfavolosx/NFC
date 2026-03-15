## 2026-02-18 - Stored XSS via Direct DOM Manipulation
**Vulnerability:** Direct interpolation of user-supplied data (link titles, URLs, tag labels) into `innerHTML` strings in multiple views (`links.js`, `tags.js`, `dashboard.js`, `writer.js`).
**Learning:** The project relies heavily on vanilla JS `innerHTML` updates for rendering, which makes it extremely prone to XSS if manual escaping is missed. There is no framework-level auto-escaping (like React or Vue).
**Prevention:** Created a centralized `escapeHTML` utility. Future views must always wrap user input with `escapeHTML` or use `textContent` instead of `innerHTML` where possible.
