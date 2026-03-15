## 2024-03-13 - XSS in Links and Tags UI
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in UI views via unescaped string interpolation in HTML template literals for `title`, `url`, `label`, and `serialNumber`.
**Learning:** Due to the lack of an HTML rendering framework that automatically escapes variables (like React or Vue), all user inputs were injected directly into the DOM using raw template literals.
**Prevention:** Always use the dedicated `escapeHTML` utility function (now defined in `src/components/modal.js`) to wrap any user-supplied or externally-provided data before interpolating it into HTML template strings.
