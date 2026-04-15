## 2025-02-18 - Prevent DOM-based XSS in Toast notifications
**Vulnerability:** The `showToast` function in `src/utils.js` (and similarly previously in `src/components/toast.js`) was interpolating user-controlled message strings directly into `innerHTML`, creating a critical DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** This existed because standard string interpolation (``) was used within `innerHTML` to construct the toast component, missing the escaping layer.
**Prevention:** Always use `textContent` to inject user-provided text into dynamically created DOM nodes, or ensure robust escaping via regex-based `escapeHTML` if HTML formatting is strictly required.## 2025-02-20 - Unescaped HTML Interpolation in Modal Component String Templates

**Vulnerability:** User-controlled data properties (`link.id`, `link.icon`, `link.title`) were directly interpolated into string templates that were then passed to a generic modal component (`openModal`) without escaping, leading to potential DOM-based Cross-Site Scripting (XSS).
**Learning:** `openModal` sets its content argument directly to `.innerHTML`. When generic views like the "redirect" activation screen create `<select>` dropdowns using dynamic content from the store (`store.links`), this dynamic content acts as an attack vector.
**Prevention:** Always use the utility `escapeHTML` to wrap any dynamic, user-provided string properties when building string templates intended for insertion into `.innerHTML` or `.content` properties of generic view components.
## 2023-10-27 - DOM-based escapeHTML fails to escape quotes
**Vulnerability:** XSS via Attribute Injection because `src/utils.js` `escapeHTML` used `div.textContent` which doesn't escape `"` or `'`.
**Learning:** `div.textContent` and `div.innerHTML` correctly escape `<`, `>`, and `&`, but NOT quotes (`"` or `'`). When interpolated into HTML attributes (like `data-url="${escapeHTML(url)}"`), this allows trivial attribute injection XSS.
**Prevention:** Always use a comprehensive regex-based escape function (replacing `&<>"'`) or a dedicated library for escaping user input before interpolation into template literals.
