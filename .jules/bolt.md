
## 2024-10-24 - Avoid Array Lookups in Template Loops
**Learning:** $O(N \times M)$ operations inside template rendering loops cause severe performance bottlenecks, especially in vanilla JS apps rendering deep HTML strings.
**Action:** Pre-compute maps outside loops for $O(1)$ lookups and pass them into row/card render functions.
