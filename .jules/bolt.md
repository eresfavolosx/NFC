## 2026-02-26 - Synchronous LocalStorage Blocking
**Learning:** `localStorage.setItem` is synchronous and blocking. Frequent writes (e.g., on every state change) can freeze the UI, especially with large JSON payloads.
**Action:** Debounce persistence operations and use `visibilitychange` to flush pending writes to ensure data integrity without performance penalty.
