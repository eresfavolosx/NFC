## 2024-03-14 - Fix DOM XSS vulnerabilities in UI components via innerHTML
**Vulnerability:** Found missing input sanitization when injecting user-provided strings (such as `title` in modals and `message` in toasts) into the DOM using template literals assigned to `innerHTML` in `src/components/modal.js` and `src/components/toast.js`. This allows DOM-based XSS if user data makes it into these parameters.
**Learning:** Reusable UI components rendering via `innerHTML` template strings are prone to XSS if arguments are not explicitly sanitized. No standard string sanitization utility previously existed in this project.
**Prevention:** Created a reusable `escapeHTML` utility function in `src/components/modal.js` (properly handling `null`/`undefined` without stripping falsy `0` values). This utility should be imported and used to wrap any untrusted strings interpolated into `innerHTML`.

## 2025-02-18 - Fix DOM-based XSS in Redirection
**Vulnerability:** Found missing input validation for user-provided URLs in `src/views/redirect.js` when setting `window.location.href = link.url`. This allows DOM-based XSS vulnerabilities if a malicious user saves a `javascript:` payload as the URL of a tag's assigned link.
**Learning:** Client-side redirections relying on database-stored properties (like user-saved URLs) require the same strict validation as direct user input. It is necessary to explicitly validate against a whitelist of safe protocols (e.g., http, https).
**Prevention:** Imported and used the `isValidUrl` utility function from `src/utils/sanitize.js` to assert that URLs are safe before client-side assignment.
