## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2024-05-14 - Optimize DOM search filtering
**Learning:** Calling `store.getLink()` or `store.getTag()` inside a DOM filtering loop (like `querySelectorAll().forEach()`) introduces unnecessary overhead, even when the lookup is O(1). Attaching search strings and filter criteria directly to the DOM nodes via `data-*` attributes during rendering eliminates object lookups entirely and significantly speeds up client-side search, reducing filter times by over 20x.
**Action:** When implementing client-side filtering on lists of DOM elements, pre-calculate the search string and attach it as a `data-` attribute during the initial render, and filter using `dataset` properties instead of fetching the underlying object.
## 2026-04-15 - Array Iteration Performance
**Learning:** Calling static functions like `Date.now()` inside array iteration callbacks (e.g., `.filter` or `.reduce`) forces the JavaScript engine to execute the function on every single iteration, which can degrade performance significantly on large arrays.
**Action:** Always hoist static function calls outside of the loop into a constant variable and reference that constant within the callback.
