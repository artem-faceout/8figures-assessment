# Command: Design Review

## Workflow
Review implemented UI against the design source and design system for visual fidelity.

### Input
- The Figma frame or mockup for the screen being reviewed
- The implemented Angular component(s)

### Steps

1. **Read the design** — Open the Figma file via MCP or reference the provided mockup
2. **Read the implementation** — Review the component template (.html) and styles (.scss)
3. **Component mapping check** — Verify every UI element uses the correct Ionic component per `skills/figma-to-ionic.md`
   - No raw `<div>` for layout
   - Correct use of slots (`slot="start"`, `slot="end"`)
   - Proper page structure (`ion-header` + `ion-content`, `ion-footer` if needed)
4. **Design system compliance** — Cross-reference with `skills/design-system.md`
   - Colors use CSS variables, not hardcoded hex
   - Typography matches the defined scale
   - Spacing uses rem values from the scale
   - Border radius matches tokens
5. **Financial formatting** — If screen shows financial data, verify against `skills/financial-data-formatting.md`
   - Dollar amounts: 2 decimal places, commas, right-aligned, monospace
   - Percentages: 2 decimal places, `+` prefix for positive
   - Color coding: green for gain, red for loss, neutral for zero
6. **Missing states** — Check for states Figma doesn't show:
   - [ ] Loading state (skeleton text)
   - [ ] Empty state (no data message)
   - [ ] Error state (API failure)
   - [ ] Pull-to-refresh (if list screen)
7. **Mobile check**
   - [ ] Touch targets >= 44x44pt
   - [ ] Content scrollable in `ion-content`
   - [ ] No horizontal overflow at 375px width
   - [ ] Safe areas respected (header/footer handle this)
8. **Visual snapshot** — Run Playwright visual tests to capture baseline or compare against existing baseline
   ```bash
   cd client && npx playwright test --grep @visual
   ```
9. **Report** — List findings as: ✅ Pass / ⚠️ Minor (won't block) / ❌ Must fix

### Output
- List of design deviations with severity
- Updated visual snapshot baselines (if new screen)
- Fixes applied for any ❌ items
