## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.

## 2026-04-02 - Accessible Toast Notifications
**Learning:** Dynamic notifications (like toast messages) generated purely via JavaScript and appended to the DOM are often completely missed by screen readers because they lack the proper ARIA roles and live region attributes to trigger an announcement.
**Action:** When implementing or modifying dynamic notification components, always add `role="alert"` and `aria-live="assertive"` for errors/warnings, and `role="status"` and `aria-live="polite"` for non-critical information/success messages to ensure visibility to assistive technologies.
