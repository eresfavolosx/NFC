## 2025-05-21 - Dynamic ARIA Labels in Lists
**Learning:** In lists of items where each item has identical action buttons (like "Edit" or "Delete"), static `aria-label` attributes (e.g., just "Edit") are insufficient for screen reader users, as they don't provide context on *which* item is being acted upon.
**Action:** Always inject the item's unique identifier (like its title) into the `aria-label` string (e.g., `aria-label="Edit ${title}"`). Ensure the injected content is escaped to prevent attribute injection issues.
