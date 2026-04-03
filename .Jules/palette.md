## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.
## 2026-04-03 - [Add ARIA live regions to toast notifications]
**Learning:** [Dynamic notification components require ARIA live regions for screen readers. Error/warning toasts should be assertive (interruptive), while success/info toasts should be polite.]
**Action:** [Always use `role="alert"` and `aria-live="assertive"` for critical notifications, and `role="status"` and `aria-live="polite"` for non-critical ones.]
