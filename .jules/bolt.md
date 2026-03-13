## 2024-03-13 - O(N²) List Rendering Bottlenecks
**Learning:** Rendering long lists of relational data (e.g., Links mapping to Tags) using `Array.prototype.find()` or `Array.prototype.filter()` inside a `.map()` callback creates severe O(N^2) or O(N*M) performance bottlenecks in JavaScript.
**Action:** Always pre-calculate a lookup `Map` outside the render loop for O(1) property access, achieving a ~4-6x rendering speedup for large datasets (e.g., 10,000 items).
