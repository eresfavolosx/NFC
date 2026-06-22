## 2024-06-22 - Standardize Empty State Pattern
**Learning:** Reusing the `.empty-state` classes defined in `components.css` instead of inline styles helps maintain visual consistency across the dashboard. Adding `aria-hidden="true"` to decorative emojis is a critical a11y step to prevent screen reader noise in empty states.
**Action:** Always check `components.css` for existing standardized UI patterns before writing custom inline styles for empty states or generic layouts.
