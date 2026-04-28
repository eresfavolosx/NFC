## 2024-03-14 - Fix DOM XSS vulnerabilities in UI components via innerHTML
**Vulnerability:** Found missing input sanitization when injecting user-provided strings (such as `title` in modals and `message` in toasts) into the DOM using template literals assigned to `innerHTML` in `src/components/modal.js` and `src/components/toast.js`. This allows DOM-based XSS if user data makes it into these parameters.
**Learning:** Reusable UI components rendering via `innerHTML` template strings are prone to XSS if arguments are not explicitly sanitized. No standard string sanitization utility previously existed in this project.
**Prevention:** Created a reusable `escapeHTML` utility function in `src/components/modal.js` (properly handling `null`/`undefined` without stripping falsy `0` values). This utility should be imported and used to wrap any untrusted strings interpolated into `innerHTML`.
## 2024-05-24 - Unescaped UI Component Inputs (XSS)
**Vulnerability:** Found unescaped template string interpolations of user-controlled inputs (`title`, `subtitle`) within common UI components like `renderHeader()`. Specifically, `store.data.user?.displayName` was injected unescaped into `dashboard.js` via the `header.js` component, creating a stored DOM XSS vector.
**Learning:** Shared UI utility components often assume inputs are "safe" or already escaped, but they are frequently called directly with raw data from the store or user profile.
**Prevention:** All UI rendering functions that construct HTML strings via template literals MUST explicitly call `escapeHTML()` on all string parameters they accept, even if they seem like internal constants.

## 2025-03-18 - Fix XSS Vulnerability in Tag Redirection
**Vulnerability:** Found missing input validation before executing `window.location.href = link.url;` in `src/views/redirect.js`. While `link.url` validation exists in the UI during creation, it can be bypassed through other means (e.g. direct API calls or direct localStorage manipulation), making it possible to store `javascript:...` payloads. When a user is redirected, this payload is executed leading to a Cross-Site Scripting (XSS) vulnerability.
**Learning:** Defense in depth dictates that validation should occur at the time of execution. Stored data cannot always be trusted, especially when the redirection logic takes place on the client side without strict backend validation.
**Prevention:** Always validate URLs using `isValidUrl` (ensuring `http:` or `https:`) right before modifying `window.location.href`.

## 2025-03-22 - Missing Update Validation in Link Storage (Stored XSS)
**Vulnerability:** Found a Stored XSS vulnerability where `isValidUrl` validation was only applied during link creation, but completely omitted during link updates in the UI (`src/views/links.js`) and within the data access layer (`src/store.js`). This allowed an attacker to create a valid link, then edit it to a malicious `javascript:` payload.
**Learning:** Validation must be applied consistently across all lifecycle events of an entity (Create AND Update). Client-side UI validation is insufficient; the data access layer (e.g., `store.js`) must also enforce strict validation rules as a defense-in-depth measure.
**Prevention:** Ensure all data modification methods (create, update, patch) in the data store enforce identical validation rules before persisting state, and enforce the same in all corresponding UI flows.

## 2025-05-24 - Unescaped Setting Injections (Stored DOM XSS)
**Vulnerability:** Found unescaped template string interpolations of user-controlled inputs (`brandName`, `restaurantName`) within the global settings view in `src/views/settings.js`. Because settings persist locally and are dynamically loaded into the innerHTML without sanitization, an attacker could inject `<script>` tags or malicious HTML attributes into these configuration fields to achieve persistent DOM-based XSS when administrators view the settings page.
**Learning:** Application-wide configuration parameters (like global settings) are often incorrectly trusted because they are seen as "admin-controlled" variables, leading to missing sanitization when rendering configuration UIs.
**Prevention:** All fields loaded from persistent storage (like `store.settings`) into `innerHTML` must be treated as untrusted and wrapped with `escapeHTML`, regardless of the assumed privilege level of the data source.
## 2024-03-23 - Reflected XSS in URL Parameters
**Vulnerability:** Found an unescaped route parameter (`id`) being injected directly into the DOM (`innerHTML`) in `src/views/redirect.js`. While typical IDs are standard UUIDs, the hash router extracts them directly from the URL fragment (e.g., `/#/r/<script>alert(1)</script>`), allowing a malicious user to craft a link that executes arbitrary JavaScript in the context of the application.
**Learning:** Even seemingly "safe" parameters like `id` must be treated as untrusted input if they are read directly from URL parameters or fragments, as they can be manipulated to create Reflected XSS vectors.
**Prevention:** Always wrap routing parameters and URL-derived variables with the `escapeHTML` utility before interpolating them into HTML strings that will be rendered via `innerHTML`.
## 2025-05-25 - Unescaped Tag Fields in Admin Console (Stored XSS)
**Vulnerability:** Found unescaped template string interpolations of user-controlled inputs (`tag.serialNumber`, `tag.ownerEmail`) within the Admin view in `src/views/admin.js`. If an attacker provisions an NFC tag with malicious payloads in these fields, the Admin UI executes the payloads when rendering the tag list.
**Learning:** Even though some fields (`tag.label`) were escaped, others were missed. This indicates a pattern of inconsistent escaping. Secondary identifying properties like serial numbers or emails must also be treated as untrusted user input, especially in administrative consoles which might be targeted for privilege escalation.
**Prevention:** Audit all properties of objects being rendered in lists. Enforce a rule that *all* object properties interpolated into HTML strings must be wrapped in `escapeHTML()`, not just the primary names or titles.

## 2024-05-24 - [CRITICAL] Fix hardcoded Firebase API Key
**Vulnerability:** Hardcoded Firebase API Key found in `src/firebase.js`.
**Learning:** Although Firebase web client API keys are generally public by design, this repository strictly classifies hardcoded API keys in configuration files as critical vulnerabilities.
**Prevention:** Use Vite environment variables (e.g., `import.meta.env?.VITE_FIREBASE_API_KEY || ''`) to avoid hardcoding secrets.
