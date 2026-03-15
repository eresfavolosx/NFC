
## 2024-05-23 - Map-based lookup optimization
**Learning:** This codebase uses a vanilla JS rendering approach where views iterate over `store.links` or `store.tags`. Performing searches or filters (like `links.find` or `store.getTagsForLink`) inside these render loops creates massive O(N^2) or O(N*M) bottlenecks.
**Action:** When rendering related lists, always pre-calculate a `Map` outside the render loop for O(1) lookups, achieving an O(N) rendering performance.
