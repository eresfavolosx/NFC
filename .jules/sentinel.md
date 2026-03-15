## 2024-05-24 - XSS in UI Components via innerHTML
**Vulnerability:** The application extensively uses `innerHTML` with template literals to render views and components (like Toasts). User-controlled data (e.g., link titles and URLs) was directly interpolated into HTML, leading to Stored XSS.
**Learning:** Transient components (Toasts) and persistent views (Link Cards) are both critical XSS vectors if they reflect unsanitized input. The absence of a centralized escaping utility led to an insecure pattern across the codebase.
**Prevention:** Always use `.textContent` for dynamic text injection in DOM nodes (e.g., in Toasts). For string-based rendering, implement and enforce a standard `escapeHTML` utility to sanitize all user-generated content before DOM injection.
