## 2024-03-14 - Fix DOM XSS vulnerabilities in UI components via innerHTML
**Vulnerability:** Found missing input sanitization when injecting user-provided strings (such as `title` in modals and `message` in toasts) into the DOM using template literals assigned to `innerHTML` in `src/components/modal.js` and `src/components/toast.js`. This allows DOM-based XSS if user data makes it into these parameters.
**Learning:** Reusable UI components rendering via `innerHTML` template strings are prone to XSS if arguments are not explicitly sanitized. No standard string sanitization utility previously existed in this project.
**Prevention:** Created a reusable `escapeHTML` utility function in `src/components/modal.js` (properly handling `null`/`undefined` without stripping falsy `0` values). This utility should be imported and used to wrap any untrusted strings interpolated into `innerHTML`.

## 2025-03-18 - Fix XSS Vulnerability in Tag Redirection
**Vulnerability:** Found missing input validation before executing `window.location.href = link.url;` in `src/views/redirect.js`. While `link.url` validation exists in the UI during creation, it can be bypassed through other means (e.g. direct API calls or direct localStorage manipulation), making it possible to store `javascript:...` payloads. When a user is redirected, this payload is executed leading to a Cross-Site Scripting (XSS) vulnerability.
**Learning:** Defense in depth dictates that validation should occur at the time of execution. Stored data cannot always be trusted, especially when the redirection logic takes place on the client side without strict backend validation.
**Prevention:** Always validate URLs using `isValidUrl` (ensuring `http:` or `https:`) right before modifying `window.location.href`.
