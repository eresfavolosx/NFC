## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2026-04-09 - Avoid O(N) evaluations in iterations
**Learning:** Native functions like `Date.now()` cannot always be optimized out of loops by the JS engine due to potential side-effects or variance. Leaving them inside array iterations like `.filter()` or `.map()` forces O(N) evaluation.
**Action:** Always hoist static or time-based evaluations (like `Date.now()`) to a constant outside loops to ensure O(1) execution and logical consistency.
