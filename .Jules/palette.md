## 2026-02-15 - Icon-Only Buttons Accessibility
**Learning:** The application frequently uses icon-only buttons (e.g., ✏️, 🗑️) for critical actions like editing and deleting items. These buttons lacked `aria-label` attributes, making them confusing or inaccessible to screen reader users who rely on text descriptions.
**Action:** Always add descriptive `aria-label` attributes to icon-only buttons. Include the name of the item being acted upon (e.g., `aria-label="Delete ${itemName}"`) to provide context in lists where multiple identical icons appear.
## 2025-04-10 - Adding Focus-Visible for Interactive Elements
**Learning:** Found that basic interactive elements (buttons, links) lacked clear `:focus-visible` styles, hindering keyboard accessibility.
**Action:** Ensure that all buttons and links have explicit, visible focus rings using `:focus-visible` to support keyboard navigation while keeping mouse interaction clean.
