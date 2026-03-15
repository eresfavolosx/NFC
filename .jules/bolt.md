## 2024-05-24 - O(N*M) View Rendering Bottlenecks
**Learning:** Found O(N*M) performance bottlenecks in `src/views/tags.js` and `src/views/links.js` during view rendering. Specifically, `Array.prototype.find()` and `store.getTagsForLink()` (which contains a `find`/`filter`) were being called inside nested render loops for each tag and link, causing significant performance degradation for large datasets.
**Action:** Always pre-calculate lookups using a `Map` before iterating over large lists or DOM nodes in render/filter functions to ensure O(N) performance.
