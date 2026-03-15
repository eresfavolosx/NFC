## 2025-02-18 - localStorage Debouncing Discrepancy
**Learning:** The documentation/memory claimed that localStorage persistence was debounced, but codebase inspection revealed it was synchronous and blocking. This caused performance degradation on rapid updates.
**Action:** Always verify performance claims in the actual codebase (read the source) before assuming optimizations are in place. Debouncing localStorage is a critical optimization for this app.
