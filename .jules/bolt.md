## 2024-05-18 - Replacing O(N^2) Array Searches with O(1) Map Lookups in Rendering
**Learning:** In frontend logic mapping models that relate to each other (e.g. Tags mapping to Links, or Links tracking Tags), nested iterations using `.find()` or `.filter()` inside the `.map()` loop cause critical O(N*M) or O(N^2) performance bottlenecks. This becomes very costly and significantly degrades rendering performance for large lists.
**Action:** When filtering or rendering lists of models that map to other models, always pre-calculate a lookup `Map` outside the loop to ensure O(1) lookups for the children elements, reducing execution time from O(N^2) to O(N).

## 2024-05-18 - Replacing O(N) array methods with imperative loops
**Learning:** Re-writing O(N) declarative array methods like `.filter()` and `.reduce()` into imperative `for` loops is a micro-optimization that degrades code readability without providing measurable performance gains in typical frontend Javascript scenarios. The actual bottleneck is usually DOM manipulation.
**Action:** Avoid replacing standard array iteration methods with `for` loops unless dealing with millions of records in a tight loop where a profiler has explicitly flagged it. Instead, focus on debouncing events that trigger DOM updates.
