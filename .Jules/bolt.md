## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2024-05-14 - Optimize DOM search filtering
**Learning:** Calling `store.getLink()` or `store.getTag()` inside a DOM filtering loop (like `querySelectorAll().forEach()`) introduces unnecessary overhead, even when the lookup is O(1). Attaching search strings and filter criteria directly to the DOM nodes via `data-*` attributes during rendering eliminates object lookups entirely and significantly speeds up client-side search, reducing filter times by over 20x.
**Action:** When implementing client-side filtering on lists of DOM elements, pre-calculate the search string and attach it as a `data-` attribute during the initial render, and filter using `dataset` properties instead of fetching the underlying object.

## 2024-05-20 - Avoid filter length array allocation
**Learning:** Chaining `.filter(condition).length` allocates a completely new intermediate array just to find out how many elements matched. In performance or memory-sensitive areas (or inside getters that run often), this adds unnecessary memory pressure and garbage collection overhead.
**Action:** Use `.reduce((count, item) => count + (condition ? 1 : 0), 0)` instead of `.filter().length` to count matching items without allocating intermediate arrays.

## 2024-05-20 - Short-circuit evaluation insights
**Learning:** If a lookup method (like a custom `TagMap.get()`) is designed to return a truthy fallback value (such as a frozen `EMPTY_ARRAY`), adding an extra fallback like `|| []` is not only redundant but does NOT incur any allocation penalty because `||` short-circuits. However, if you blindly remove `|| []` thinking it's an optimization, you may introduce a bug if the method actually returns `undefined`, changing the return type and causing crashes.
**Action:** Never remove a fallback `|| []` unless you are absolutely certain the left side cannot be `undefined` or `null`. Understand short-circuiting: `truthy || []` never executes the array literal allocation.
