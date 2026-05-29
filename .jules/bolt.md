## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2024-05-29 - Hoist Constants Out of Array Iteration Loops
**Learning:** Evaluating constants like `Date.now() - 86400000` inside `.filter()` or `.map()` loops forces JS to needlessly re-evaluate them on every iteration, creating an O(N) overhead for operations that should be O(1).
**Action:** Always identify and hoist static evaluations out of loop predicates to pre-calculate the constant once.
