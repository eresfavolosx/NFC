## 2024-05-24 - O(N*M) Rendering and Filtering Bottlenecks
**Learning:** When filtering or rendering lists of models that map to other models (e.g., Links and Tags), using `find()` or `filter()` inside a loop causes an O(N*M) or O(N^2) bottleneck. This happened when rendering lists and calling `getTagsForLink` or finding assigned links.
**Action:** Always pre-calculate a lookup `Map` outside the loop to ensure O(1) lookups and avoid nested linear searches.
