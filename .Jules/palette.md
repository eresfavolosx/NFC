## 2024-05-23 - Dynamic Error Messages
**Learning:** Error messages injected dynamically into the DOM (like "Wrong PIN") are not announced by screen readers unless the container has `aria-live="assertive"` or `role="alert"`.
**Action:** Always add `aria-live` to error containers in HTML templates, even if empty initially.
