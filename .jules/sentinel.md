
## 2024-05-24 - Fix DOM-based XSS in UI Components
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `showToast` and `openModal` components via string interpolation into `innerHTML`.
**Learning:** `innerHTML` was used to construct entire UI elements, including injecting user-controlled text directly into the markup. This allowed malicious payloads (e.g., `<img src=x onerror=...>`) to be executed by the browser.
**Prevention:** Avoid injecting dynamic data directly into `innerHTML`. Instead, create the structural HTML safely (without data), and then assign user-provided text using `.textContent` on the specific elements.
