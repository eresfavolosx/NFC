## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2026-04-27 - Prevent Array Allocation in Count Operations
**Learning:** Chaining `.filter(condition).length` to calculate counts in Javascript creates a short-lived intermediate array, which increases memory allocation and garbage collection pressure, particularly on hot code paths like UI render functions.
**Action:** Use `.reduce((count, item) => condition ? count + 1 : count, 0)` to calculate counts cleanly without allocating redundant temporary arrays.
