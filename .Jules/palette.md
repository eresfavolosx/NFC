## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.
## 2025-04-10 - Adding Focus-Visible for Interactive Elements
**Learning:** Found that basic interactive elements (buttons, links) lacked clear `:focus-visible` styles, hindering keyboard accessibility.
**Action:** Ensure that all buttons and links have explicit, visible focus rings using `:focus-visible` to support keyboard navigation while keeping mouse interaction clean.
## 2024-04-10 - Dynamic ARIA attributes on Toast Notifications
**Learning:** Setting static `aria-live` and `aria-atomic` on a global notification container is less accessible, especially when rendering multiple messages of different severities simultaneously or frequently. Global properties may fail to correctly signal the true urgency of individual updates.
**Action:** Always configure `role` and `aria-live` attributes dynamically on individual notification elements. Use `role="alert"` and `aria-live="assertive"` for errors/warnings, and `role="status"` and `aria-live="polite"` for non-critical informational messages.
## $(date +%Y-%m-%d) - Dynamic innerHTML Accessibility Regressions
**Learning:** This app frequently resets button states (like loading -> idle) using vanilla JavaScript `innerHTML` assignments. This pattern easily drops `aria-hidden="true"` attributes on decorative icons if the reset string doesn't explicitly include them, creating screen reader noise.
**Action:** Always verify that vanilla JS state resets (e.g., `btn.innerHTML = ...`) include the exact same ARIA attributes on child elements as the original static HTML.
