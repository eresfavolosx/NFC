## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2026-05-22 - Hoisting static evaluations from array iterations
**Learning:** When performing optimizations, hoisting static or constant evaluations (such as `Date.now() - 86400000`) outside of loops converts O(N) operations to O(1) and prevents redundant calculation overhead without sacrificing readability.
**Action:** Always scan for and hoist invariant calculations out of `filter`, `map`, `reduce`, or  loops.
## 2026-05-22 - Hoisting static evaluations from array iterations
**Learning:** When performing optimizations, hoisting static or constant evaluations (such as `Date.now() - 86400000`) outside of loops converts O(N) operations to O(1) and prevents redundant calculation overhead without sacrificing readability.
**Action:** Always scan for and hoist invariant calculations out of `filter`, `map`, `reduce`, or `forEach` loops.
