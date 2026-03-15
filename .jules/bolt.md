## 2024-05-24 - Debounced LocalStorage Writes
**Learning:** Frequent synchronous writes to `localStorage` (via `JSON.stringify`) can block the main thread and cause UI jank, especially when triggered by rapid updates (e.g., typing).
**Action:** Always debounce persistence logic (e.g., 500ms) and include a mechanism to flush pending saves on page unload/visibility change to prevent data loss.
