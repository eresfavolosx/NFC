## 2025-02-18 - Prevent DOM-based XSS in Toast notifications
**Vulnerability:** The `showToast` function in `src/utils.js` (and similarly previously in `src/components/toast.js`) was interpolating user-controlled message strings directly into `innerHTML`, creating a critical DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** This existed because standard string interpolation (``) was used within `innerHTML` to construct the toast component, missing the escaping layer.
**Prevention:** Always use `textContent` to inject user-provided text into dynamically created DOM nodes, or ensure robust escaping via regex-based `escapeHTML` if HTML formatting is strictly required.## 2025-02-20 - Unescaped HTML Interpolation in Modal Component String Templates

**Vulnerability:** User-controlled data properties (`link.id`, `link.icon`, `link.title`) were directly interpolated into string templates that were then passed to a generic modal component (`openModal`) without escaping, leading to potential DOM-based Cross-Site Scripting (XSS).
**Learning:** `openModal` sets its content argument directly to `.innerHTML`. When generic views like the "redirect" activation screen create `<select>` dropdowns using dynamic content from the store (`store.links`), this dynamic content acts as an attack vector.
**Prevention:** Always use the utility `escapeHTML` to wrap any dynamic, user-provided string properties when building string templates intended for insertion into `.innerHTML` or `.content` properties of generic view components.
## 2024-05-24 - Unescaped HTML Interpolation in Main and Templates views

**Vulnerability:** User-controlled data properties (`l.id`, `l.icon`, `l.title`, `t.id`, `t.label`, `t.name`, `t.description`) were directly interpolated into string templates that were then rendered in the DOM without escaping, leading to potential DOM-based Cross-Site Scripting (XSS).
**Learning:** `src/main.js` and `src/views/templates.js` were using unescaped values directly. When creating dynamic UI components using template literals containing user inputs (even if the values are seemingly safe like an `id`), they must be escaped before being attached to the DOM using methods such as `.innerHTML`.
**Prevention:** Always use the utility `escapeHTML` to wrap any dynamic, user-provided string properties when building string templates intended for insertion into `.innerHTML` or `.content` properties of generic view components.
