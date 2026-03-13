## 2024-05-14 - Keyboard navigation broken for action buttons hidden with opacity
**Learning:** When using `opacity: 0` to hide action buttons (like in `.link-card`), they become inaccessible to keyboard users tabbing through the interface since `:hover` doesn't trigger.
**Action:** Always use `:focus-within` on the parent container (e.g., `.link-card:focus-within .link-card-actions`) in addition to `:hover` to ensure keyboard users can reveal and access the controls.
