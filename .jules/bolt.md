## 2025-05-23 - [Debounce Persistence Safety]
**Learning:** Debouncing `localStorage` writes improves performance but introduces data loss risk if the user closes the tab before the timer fires.
**Action:** Always implement a `flush()` method on the debounce utility and trigger it via `document.addEventListener('visibilitychange')` (checking for `hidden` state) to ensure pending writes are persisted on unload.
