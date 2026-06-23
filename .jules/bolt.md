## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2024-11-20 - Avoid Array.unshift() sequentially inside loops
**Learning:** Using `unshift()` inside a loop shifts existing elements on every iteration and creates an O(N^2) memory reallocation bottleneck. Furthermore, using spread syntax with `unshift` (e.g., `arr.unshift(...newItems)`) for large arrays can trigger a `RangeError: Maximum call stack size exceeded`.
**Action:** When adding multiple items to the beginning of a large array, accumulate the new items in a temporary array and prepend them using array concatenation (e.g., `arr = newItems.concat(arr)`), making sure to reverse the items if the order must match individual `unshift` behavior.
