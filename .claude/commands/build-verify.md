# Command: Build & Verify

> **Scope:** Quick sanity check during development. For the full quality gate before committing (tests, senior review, architecture, design, visual snapshots, contract drift), use `commands/post-feature.md` instead.

## Workflow
Fast build verification to catch compile/lint/build errors mid-development.

### Steps

1. **Lint** — `cd client && ng lint` → must pass clean
2. **Type check** — `cd client && npx tsc --noEmit` → zero errors
3. **Build** — `cd client && ng build` → successful production build
4. **Capacitor sync** — `cd client && npx cap sync` → no errors
5. **Server check** — `cd server && python -m py_compile main.py` → no syntax errors
6. **Manual browser test** — Open localhost:4200, check all features
7. **Report** — List any issues found, or confirm all clear

### If issues found
Fix issues following `skills/code-review-checklist.md`, then re-run this workflow.
