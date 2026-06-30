## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2026-04-09 - Avoid sequential unshifts in loops
**Learning:** Sequential `unshift()` operations inside a loop cause O(N^2) memory reallocation bottlenecks, degrading performance when creating large volumes of items. The unshift method shifts all existing array elements up by one index for every single insertion.
**Action:** Replace `unshift()` calls in loops with array concatenation (`concat`). Accumulate items in a local array using `push()`, and then use `[...newItems].reverse().concat(existingItems)` to prepend the new items while preserving the reverse-insertion order.
