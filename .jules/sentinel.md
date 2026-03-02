## 2025-03-02 - XSS Vulnerability via DOM Injection
**Vulnerability:** UI components (`toast.js` and `modal.js`) were susceptible to DOM-based Cross-Site Scripting (XSS). User-controlled text strings (`message`, `title`, `submitLabel`) were being concatenated directly into template literals and assigned via `element.innerHTML = ...`.
**Learning:** This existed because of the convenience of template literals for constructing UI components without considering the origin and trustworthiness of the data being injected.
**Prevention:** Always use `textContent` to safely assign dynamic text content to DOM elements. When innerHTML is absolutely necessary for structured content, ensure any dynamic strings within the content are sanitized using an `escapeHTML` utility prior to injection.
