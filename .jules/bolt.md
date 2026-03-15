# Bolt's Journal

## 2025-01-22 - Debouncing LocalStorage Writes
**Learning:** Synchronous `localStorage.setItem` blocks the main thread, especially when serializing large JSON objects.
**Action:** Always debounce persistence operations for large state objects and use `visibilitychange` to flush pending writes.
