# Command: Review and Fix

## Workflow
Review existing code for quality issues and fix them.

### Steps

1. **Lint check** — Run `ng lint` and fix all errors
2. **Type check** — Run `npx tsc --noEmit` and fix all type errors
3. **Review checklist** — Go through `skills/code-review-checklist.md` file by file
4. **Mobile check** — Verify Ionic components are used correctly
5. **Financial formatting** — Verify against `skills/financial-data-formatting.md`
6. **Fix issues** — Apply fixes
7. **Commit** — `fix: <description of what was fixed>`

### Common findings
- `any` types that slipped through
- Missing error handling on API calls
- Console.logs left in code
- Non-Ionic HTML elements used for layout
- Missing loading states
