## 2024-03-05 - Optimize array lookups in view rendering
**Learning:** Rendering views with `N` items while performing a linear search `.find()` or `.filter()` over `M` items (e.g., finding tags for each link, or links for each tag) creates an $O(N \times M)$ performance bottleneck on the main thread, leading to poor UI rendering performance.
**Action:** When rendering lists or filtering, pre-calculate a lookup map (e.g., a `Map` or an object) from the secondary array, changing the complexity to $O(N + M)$.
