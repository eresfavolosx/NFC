## 2025-02-18 - Prevent DOM-based XSS in Toast notifications
**Vulnerability:** The `showToast` function in `src/utils.js` (and similarly previously in `src/components/toast.js`) was interpolating user-controlled message strings directly into `innerHTML`, creating a critical DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** This existed because standard string interpolation (``) was used within `innerHTML` to construct the toast component, missing the escaping layer.
**Prevention:** Always use `textContent` to inject user-provided text into dynamically created DOM nodes, or ensure robust escaping via regex-based `escapeHTML` if HTML formatting is strictly required.
## 2025-02-18 - Prevent DOM-based XSS in href attributes with escaped URLs
**Vulnerability:** In `src/views/redirect.js`, URLs generated from `link.url` were being injected into the `href` attribute of `<a>` tags without escaping, solely relying on the `isValidUrl` protocol check (`http:`/`https:`). This exposed a DOM-based XSS vector because valid HTTP URLs can contain double quotes (e.g. `http://example.com" onclick="alert(1)`), which would break out of the `href` attribute context when interpolated via template literals.
**Learning:** Validating that a URL has a safe protocol does NOT protect against attribute injection if the URL is placed directly into HTML without context-aware escaping.
**Prevention:** Always combine protocol validation (`isValidUrl`) with robust HTML attribute escaping (`escapeHTML`) when interpolating user-controlled URLs into the DOM.
