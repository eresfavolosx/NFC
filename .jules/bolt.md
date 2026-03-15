
## 2024-03-10 - Map-based lookups for O(N^2) view loops
**Learning:** In list views mapping elements to external models (e.g. `src/views/links.js` finding tags for each link, and `src/views/tags.js` finding a link for each tag), performing nested linear searches (`.filter()` or `.find()`) creates an O(N^2) rendering bottleneck, scaling extremely poorly when rendering thousands of items.
**Action:** When filtering or rendering lists of models that map to other models, always pre-calculate a lookup Map outside the loop to ensure O(1) lookups, dropping time complexity from O(N*M) down to O(N).
