## 2024-05-22 - Synchronous LocalStorage Blocking
**Learning:** The application's `store._notify()` function synchronously writes the entire state to `localStorage` on every change. This creates a blocking operation that scales with the size of the state, causing noticeable jank during rapid updates.
**Action:** Always decouple `localStorage` persistence from UI updates using a debounce mechanism to ensure the main thread remains responsive. Use `visibilitychange` to flush pending writes on page exit.
