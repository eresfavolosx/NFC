## 2024-05-24 - [Fix DOM-based XSS via Template Literals in Modals and Toasts]
**Vulnerability:** Core UI components (Toast, Modal) directly assigned unsanitized user inputs (e.g., error messages, modal titles) via `innerHTML` using template literals.
**Learning:** This approach bypasses browser XSS protection by rendering user inputs as live DOM nodes, enabling script execution if user input contains unescaped HTML.
**Prevention:** For elements rendering only text, assign inputs directly to `.textContent` *after* structure creation, rather than interpolating into an `innerHTML` string. For elements requiring markup (e.g., `<p>...</p>`), explicitly sanitize any interpolated dynamic variables using an `escapeHTML` utility function before injection.
