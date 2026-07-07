## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2024-07-07 - Avoid Sequential unshift() Inside Loops
**Learning:** Calling `unshift()` sequentially inside a loop creates an O(N^2) memory reallocation bottleneck as existing elements are shifted on every iteration. Attempting to use spread syntax with `unshift` (e.g., `arr.unshift(...newItems)`) for potentially large arrays can trigger a `RangeError: Maximum call stack size exceeded`.
**Action:** When adding multiple items to the beginning of a large array, accumulate the new items in a temporary array, reverse it (if replicating the inherently reversed insertion order of sequential unshifts), and prepend using array concatenation (`arr = [...newItems].reverse().concat(arr)`).
