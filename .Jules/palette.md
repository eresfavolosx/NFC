## 2025-02-18 - Visual PIN Feedback Accessibility
**Learning:** Visual-only indicators (like filling dots) leave screen reader users completely unaware of input progress. Adding `aria-label` to buttons isn't enough; they need to know *how many* digits they've entered.
**Action:** Always pair visual progress indicators with a hidden `aria-live` region that explicitly narrates the state change (e.g., "1 digit entered").
