## 2025-02-27 - Enhance custom toggle switches accessibility
**Learning:** Custom toggle switches implemented as visually hidden checkboxes with adjacent label structures need explicit `for` attributes linking the text labels to the inputs, and any helper text must be linked via `aria-describedby` to ensure screen readers correctly associate the purpose and description with the control.
**Action:** Always associate descriptive labels and helper text with custom interactive controls like toggle switches using explicit ARIA attributes.
