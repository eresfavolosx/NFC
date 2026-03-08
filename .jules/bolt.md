## 2026-03-08 - O(N*M) Bottleneck in View Rendering
**Learning:** Rendering lists of models that map to other models (e.g., Links and Tags) using `.find()` or `.filter()` inside the loop causes significant O(N*M) performance bottlenecks, especially when the lists grow large.
**Action:** Always pre-calculate a lookup Map outside the loop to ensure O(1) lookups and replace O(N*M) nested loops with O(N) linear time complexity.
