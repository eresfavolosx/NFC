## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.

## 2026-04-03 - Toast Notification Accessibility
**Learning:** Dynamic notifications (like toasts) are not automatically announced by screen readers when they appear on the screen, causing visually impaired users to miss important feedback (like errors or success messages).
**Action:** Always add `role="alert"` and `aria-live="assertive"` for critical notifications (errors, warnings), and `role="status"` and `aria-live="polite"` for non-critical information or success messages to ensure they are announced appropriately.
