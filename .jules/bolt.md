## 2024-05-18 - Replacing O(N^2) Array Searches with O(1) Map Lookups in Rendering
**Learning:** In frontend logic mapping models that relate to each other (e.g. Tags mapping to Links, or Links tracking Tags), nested iterations using `.find()` or `.filter()` inside the `.map()` loop cause critical O(N*M) or O(N^2) performance bottlenecks. This becomes very costly and significantly degrades rendering performance for large lists.
**Action:** When filtering or rendering lists of models that map to other models, always pre-calculate a lookup `Map` outside the loop to ensure O(1) lookups for the children elements, reducing execution time from O(N^2) to O(N).

## 2024-05-18 - Replacing O(N) Arrays with O(1) Maps in Centralized Store Getters
**Learning:** Frequent UI rerenders or logic that accesses relations mapping tags to links trigger O(N) lookups via `find()` or `filter()` inside `getLink`, `getTag`, and `getTagsForLink` whenever data is queried. This causes massive redundant O(N) queries during high-frequency tasks.
**Action:** Centralize relational lookup Maps (`linksById`, `tagsById`, etc.) within the global state management (e.g. `store.js`) using a lazy-loaded cache that invalidates only when data mutates. Then, allow UI components to query the store in O(1) time without rebuilding the structures locally.
