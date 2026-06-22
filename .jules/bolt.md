## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2026-06-22 - Spread Operator Call Stack Limits
**Learning:** Using the spread operator (`...`) with `unshift` on very large accumulated arrays can trigger a `RangeError: Maximum call stack size exceeded`.
**Action:** Use array concatenation (`arr = newItems.concat(arr)`) or safely loop backward to prepend items instead of relying on spread syntax for unbounded collections.
