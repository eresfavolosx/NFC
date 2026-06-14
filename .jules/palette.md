## 2024-06-14 - Initialize Palette Journal
**Learning:** Started keeping track of specific UX/a11y insights in this codebase.
**Action:** Will document critical learnings here.

## 2024-06-14 - Standardized Empty States & Accessibility
**Learning:** Found inconsistent empty state implementations and missing ARIA attributes on decorative icons. The app defines standard empty state CSS classes (.empty-state, .empty-state-icon, .empty-state-desc) that should be used universally.
**Action:** Replaced inline styles and generic paragraphs with the standard empty state component structure and added aria-hidden="true" to decorative emojis.
