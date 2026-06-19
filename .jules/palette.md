## 2024-06-19 - Accessible Toggle Switches
**Learning:** Standalone toggle switches (where the label text is adjacent to the custom checkbox container rather than wrapping it) often lack accessible names, breaking screen reader announcements. Clicking the adjacent text also fails to toggle the switch, hurting usability.
**Action:** Always link adjacent text labels to custom toggle inputs using the `for` attribute and link helper descriptions with `aria-describedby` to improve both screen reader accessibility and click target sizes.
