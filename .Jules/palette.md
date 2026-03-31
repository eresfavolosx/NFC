## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.

## 2026-03-31 - Dynamic Toast Accessibility
**Learning:** Toast notifications provide essential visual feedback for success, error, and info states, but without specific ARIA attributes, they remain completely invisible to screen readers, leaving users unaware of critical application state changes.
**Action:** Always implement dynamic notification components with `role="alert"` and `aria-live="assertive"` for errors/warnings, and `role="status"` and `aria-live="polite"` for non-critical information/success messages.
