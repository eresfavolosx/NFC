## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.
## 2026-05-03 - Optimization of assignLinkToTag
**Learning:** Store operations like assignLinkToTag originally used linear Array.find() on underlying data arrays. Replacing these with existing cached Map getters (getTag, getLink) enforces access control and turns O(N) searches into O(1) lookups.
**Action:** Always prefer cached Map lookups over Array.find() when centralized helper getters exist, as they provide both algorithmic improvements and domain safety checks.
