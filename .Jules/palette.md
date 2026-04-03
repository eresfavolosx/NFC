## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.

## 2026-02-16 - Dynamic Toast Notification Accessibility
**Learning:** Toast notifications generated dynamically via JavaScript were visually apparent but entirely invisible to screen reader users because they lacked proper ARIA live region attributes.
**Action:** When adding dynamic notification elements to the DOM, ensure they include `role="alert"` with `aria-live="assertive"` for critical feedback (errors/warnings), and `role="status"` with `aria-live="polite"` for non-critical information (success/info), so they are announced appropriately by screen readers.
