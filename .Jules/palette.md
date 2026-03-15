## 2024-05-22 - Keyboard Accessibility for Hidden Actions
**Learning:** Elements hidden with `opacity: 0` remain focusable but invisible to keyboard users. Using `:hover` alone to reveal them creates an accessibility barrier.
**Action:** Always pair `:hover` reveal effects with `:focus-within` on the parent container (or `:focus` on the element itself) to ensure keyboard users can perceive the controls when they tab to them.
