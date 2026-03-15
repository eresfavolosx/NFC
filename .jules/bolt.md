## 2024-05-24 - [Avoid O(N*M) lookups in rendering lists by using Map]
**Learning:** Using Array `.find()` or `.filter()` inside loops or event handlers (e.g. rendering loops like `renderLinkCard` inside a `.map()`) leads to severe O(N*M) or O(N^2) bottlenecks as list sizes grow.
**Action:** Always pre-calculate lookups using `Map` prior to iterating over the primary list, reducing lookups to O(1) operations.
