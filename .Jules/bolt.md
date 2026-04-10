## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2026-04-08 - Fast DOM Filtering using data-* Attributes
**Learning:** Performing store lookups (`store.getLink()`, `store.getTag()`) and allocating strings (`.toLowerCase()`) inside a rendering filter loop across potentially hundreds of DOM nodes triggers N+1 overhead and GC pressure, creating a UI bottleneck on keystroke.
**Action:** When filtering a DOM list, pre-calculate the search strings during the initial render and attach them to the DOM elements as `data-search` attributes. Then, query the dataset attributes directly during the loop instead of reaching back into the data store or allocating strings.
