## 2026-06-10 - Standardize Empty State Component
**Learning:** The 'no activity' empty states often lacked semantic HTML and relied heavily on inline styling, which missed opportunities for accessibility hooks like `aria-hidden` on decorative icons.
**Action:** Replaced inline-styled empty states with the existing `.empty-state` component classes (`.empty-state-icon`, `.empty-state-desc`) and explicitly hid decorative emojis from screen readers using `aria-hidden="true"`.
