## 2024-05-15 - DOM Filtering Loops Bottleneck
**Learning:** Calling `Array.prototype.find()` or helper wrappers like `store.getTag()` inside a DOM element iteration loop (e.g. `querySelectorAll().forEach()`) causes an $O(N^2)$ algorithmic bottleneck, resulting in severe frame drops and jank during search/filter operations on large datasets.
**Action:** Always pre-calculate a lookup `Map` ($O(N)$) outside the DOM iteration loop to ensure $O(1)$ property access per item, which is critical for maintaining responsive UI filtering when dealing with datasets over 1,000 items.
