## 2024-05-18 - Replacing O(N^2) Array Searches with O(1) Map Lookups in Rendering
**Learning:** In frontend logic mapping models that relate to each other (e.g. Tags mapping to Links, or Links tracking Tags), nested iterations using `.find()` or `.filter()` inside the `.map()` loop cause critical O(N*M) or O(N^2) performance bottlenecks. This becomes very costly and significantly degrades rendering performance for large lists.
**Action:** When filtering or rendering lists of models that map to other models, always pre-calculate a lookup `Map` outside the loop to ensure O(1) lookups for the children elements, reducing execution time from O(N^2) to O(N).

## 2024-05-28 - Lazy-Loaded State Caches vs In-Render Map Rebuilds
**Learning:** O(N) lookup maps (like mapping tags by link ID) instantiated inside render functions or search keystroke handlers cause redundant Map instantiations and O(N) loop traversals (or even O(N) * Keystrokes) when filtering, degrading interaction performance on large datasets.
**Action:** When filtering or rendering lists of models that map to other models, store lazy-loaded caches (`_cache.tagsByLinkId`) in the global state (`store.js`) that are invalidated inside a centralized state notification method (`_notify()`), ensuring lookup maps are built exactly once per state mutation and queried in O(1) time during renders/interactions.

## 2024-05-18 - Replacing O(N) Arrays with O(1) Maps in Centralized Store Getters
**Learning:** Frequent UI rerenders or logic that accesses relations mapping tags to links trigger O(N) lookups via `find()` or `filter()` inside `getLink`, `getTag`, and `getTagsForLink` whenever data is queried. This causes massive redundant O(N) queries during high-frequency tasks.
**Action:** Centralize relational lookup Maps (`linksById`, `tagsById`, etc.) within the global state management (e.g. `store.js`) using a lazy-loaded cache that invalidates only when data mutates. Then, allow UI components to query the store in O(1) time without rebuilding the structures locally.

## 2024-05-18 - Replacing O(N) array methods with imperative loops
**Learning:** Re-writing O(N) declarative array methods like `.filter()` and `.reduce()` into imperative `for` loops is a micro-optimization that degrades code readability without providing measurable performance gains in typical frontend Javascript scenarios. The actual bottleneck is usually DOM manipulation.
**Action:** Avoid replacing standard array iteration methods with `for` loops unless dealing with millions of records in a tight loop where a profiler has explicitly flagged it. Instead, focus on debouncing events that trigger DOM updates.

## 2024-06-12 - N+1 State Getter Overhead in Rendering Loops
**Learning:** Calling a state getter inside a mapping loop (e.g., `store.getTagsForLink(link.id)` inside `links.map()`) introduces an N+1 overhead. Even if the underlying state getter uses O(1) map lookups, crossing the getter boundary `N` times for a large collection adds unnecessary execution cost and negatively impacts rendering times.
**Action:** Pre-fetch mapped properties or necessary lazy-loaded state objects (like a `tagsByLinkId` Map) into a local variable before iterating. Then use this local variable in the mapping function to achieve significant performance improvements while keeping O(1) lookups.
