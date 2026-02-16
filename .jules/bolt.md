## 2024-05-23 - Synchronous Storage Bottleneck
**Learning:** `localStorage` writes are synchronous and block the main thread. Frequent updates (e.g., via `_notify` on every change) cause noticeable UI lag, especially with growing data.
**Action:** Always debounce persistence calls when using synchronous storage backends, or switch to async storage (IndexedDB) for larger datasets. Use `beforeunload` to prevent data loss.
