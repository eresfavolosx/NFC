## 2025-03-08 - DOM-based XSS via Template Literals
**Vulnerability:** User-controlled data (e.g., toast messages, link titles) was directly interpolated into HTML using template literals and injected via `innerHTML`.
**Learning:** This architectural pattern—using vanilla JS template literals without a templating engine (like React/Vue) that auto-escapes by default—leaves the application highly susceptible to DOM-based XSS when assigning content dynamically to `innerHTML`.
**Prevention:** Avoid `innerHTML` for dynamic content where possible, preferring `textContent`. For cases where HTML structures must be generated via template literals, explicitly sanitize user inputs using a utility like `escapeHTML` before interpolation.
