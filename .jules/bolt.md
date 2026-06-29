## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2025-02-27 - O(N^2) Array Unshift Bottleneck in Bulk Operations
**Learning:** Sequential `unshift()` calls inside loops cause severe memory reallocation bottlenecks for large arrays, as the JavaScript engine must shift all existing elements on every iteration.
**Action:** When prepending multiple items to an array, accumulate them in a temporary array, reverse it (if maintaining insertion order), and use `.concat()` instead of `unshift()` to reduce time complexity from O(N^2) to O(N).
