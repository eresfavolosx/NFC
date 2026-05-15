## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2026-05-15 - Beware of Accidental Overhead in Iteration Optimizations
**Learning:** When trying to optimize array iterations (like swapping `.filter().length` for `.reduce()`), introducing new object instantiations or parsing logic inside the iteration (e.g., changing `a.timestamp > cutoff` to `new Date(a.timestamp).getTime() > cutoff`) causes massive memory allocation and processing overhead, completely negating the intended optimization and creating a severe performance regression.
**Action:** When replacing array operators, ensure the inner comparison logic remains exactly the same, or at least avoid adding new instantiation or parsing steps within the loop body.
