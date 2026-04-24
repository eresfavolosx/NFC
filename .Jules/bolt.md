## 2026-04-08 - Avoid N+1 Map Pre-fetching Micro-optimizations
**Learning:** Pre-fetching Maps and replacing simple property getter calls inside loops with closures or pre-fetched map references is considered a 'useless micro-optimization' and an architectural anti-pattern in JS, as property access is extremely fast. Additionally, attempts to provide default fallbacks using arrays (e.g., `[]`) inside those loops degrades memory by allocating unused arrays.
**Action:** Do not attempt to optimize O(N) property getters that rely on internal lazy-caching Maps. If a fallback array is absolutely necessary, subclass the `Map` to return a shared `Object.freeze([])` instance to avoid memory bloat.

## 2024-05-14 - Optimize DOM search filtering
**Learning:** Calling `store.getLink()` or `store.getTag()` inside a DOM filtering loop (like `querySelectorAll().forEach()`) introduces unnecessary overhead, even when the lookup is O(1). Attaching search strings and filter criteria directly to the DOM nodes via `data-*` attributes during rendering eliminates object lookups entirely and significantly speeds up client-side search, reducing filter times by over 20x.
**Action:** When implementing client-side filtering on lists of DOM elements, pre-calculate the search string and attach it as a `data-` attribute during the initial render, and filter using `dataset` properties instead of fetching the underlying object.

## 2024-05-24 - Avoid Memory Allocation in Counting Loops
**Learning:** Chaining `.filter(condition).length` is a common anti-pattern that creates an unnecessary intermediate array just to count matching elements, degrading memory efficiency and triggering garbage collection. Additionally, calling non-deterministic functions like `Date.now()` inside iterative loops introduces redundant evaluation overhead on every iteration.
**Action:** When counting elements based on a condition, always use `.reduce((count, item) => count + (condition ? 1 : 0), 0)` to prevent array allocation. Furthermore, always hoist static expressions or function calls (like `Date.now()`) outside of loops into a constant to prevent repetitive execution.
