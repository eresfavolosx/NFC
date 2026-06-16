## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2026-04-09 - Avoid unshift inside loops
**Learning:** Sequential `.unshift()` calls inside a loop iterate through and shift all elements of the array on every iteration, leading to $O(N^2)$ memory reallocation overhead which scales poorly on large arrays.
**Action:** Batch elements intended for prepending into a temporary array and perform a single $O(N)$ prepending operation using the spread operator: `arr.unshift(...newItems.reverse())`.
