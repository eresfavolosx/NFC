## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2026-04-09 - Avoid O(N^2) unshift inside loop
**Learning:** Using `unshift()` sequentially inside a loop creates an O(N^2) memory reallocation bottleneck because it shifts all existing array elements on every iteration.
**Action:** Accumulate new items in a temporary array during the loop, and prepend them afterwards using `[...newItems].reverse().concat(existingItems)`.
