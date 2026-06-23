## 2026-06-23 - Connect Labels to Custom Toggle Switches
**Learning:** Custom toggle switches implemented with wrapping `<label>` elements often leave adjacent explanatory text labels disconnected. This breaks screen reader associations and frustrates users who expect clicking the adjacent text to toggle the switch.
**Action:** Always connect adjacent text labels to checkbox inputs using the `for` attribute and link helper descriptions using `aria-describedby`.
