## 2025-02-18 - Prevent DOM-based XSS in Toast notifications
**Vulnerability:** The `showToast` function in `src/utils.js` (and similarly previously in `src/components/toast.js`) was interpolating user-controlled message strings directly into `innerHTML`, creating a critical DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** This existed because standard string interpolation (``) was used within `innerHTML` to construct the toast component, missing the escaping layer.
**Prevention:** Always use `textContent` to inject user-provided text into dynamically created DOM nodes, or ensure robust escaping via regex-based `escapeHTML` if HTML formatting is strictly required.
## 2025-02-18 - Prevent DOM-based XSS in dropdown options
**Vulnerability:** In `src/views/redirect.js`, user-controlled data (`link.title` and `link.icon`) was interpolated directly into `<option>` tags within a template literal (`innerHTML`), creating a high-priority XSS risk when mapping over link data.
**Learning:** This happened because when arrays of objects are mapped to HTML strings and then joined, standard escaping via `textContent` is not possible (since it's a string building process). The template variables lacked explicit escaping.
**Prevention:** Whenever generating HTML strings manually using map and join, always explicitly wrap all user-controlled variables with an `escapeHTML` utility before interpolation.
