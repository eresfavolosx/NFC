## 2024-03-22 - Synchronous LocalStorage Writes
**Learning:** Synchronous `localStorage` writes on every state change block the main thread significantly (over 200ms for 1000 items).
**Action:** Always debounce `localStorage` persistence and use `visibilitychange` to flush pending writes.
