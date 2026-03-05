## 2024-05-18 - Keyboard accessibility for hidden list item actions
**Learning:** When hiding elements (like list actions) using `opacity: 0` and revealing them on `:hover`, keyboard accessibility is broken because the elements cannot be seen when tabbing into them.
**Action:** Always pair `:hover` with `:focus-within` on the parent container so that tabbing into the hidden actions reveals them.