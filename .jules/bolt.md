## 2024-05-24 - Avoid O(N*M) lookups inside rendering routines and map callbacks
**Learning:** Using `Array.find()` or array-iterating methods like `store.getLink()` or `store.getTag()` repeatedly within list rendering maps (`.map()`) or DOM iterations (`.forEach()`) introduces severe O(N*M) UI bottlenecks, especially for components representing tag-link associations.
**Action:** Always pre-calculate relations using a `Map` (e.g. `const linkMap = new Map(links.map(l => [l.id, l]))`) outside the iteration loop, enabling O(1) memory lookup for related data.
