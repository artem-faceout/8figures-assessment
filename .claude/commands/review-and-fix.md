# Command: Review and Fix

> **Scope:** Standalone code review — use anytime to audit existing code quality. For the full pre-commit quality gate during feature development (which adds tests, contract drift check, visual snapshots, and commit), use `commands/post-feature.md` instead.

## Workflow
Full code review at senior/principal engineer level. Checks surface issues, stack-specific patterns, and architecture.

### Steps

1. **Automated checks**
   - Run `cd client && ng lint` → fix all errors
   - Run `cd client && npx tsc --noEmit` → fix all type errors
   - Run `cd server && source .venv/bin/activate && python -m py_compile main.py` → verify no syntax errors

2. **Surface review** — go through `skills/code-review-checklist.md` surface checks section

3. **Angular senior review** (if client code changed)
   - Run through every item in `skills/angular-senior-review.md`
   - Pay special attention to: OnPush, signal patterns, @if/@for control flow, input()/output() functions, smart/dumb separation, lazy loading
   - Check the reference example at the bottom — does our code match that quality?

4. **FastAPI senior review** (if server code changed)
   - Run through every item in `skills/fastapi-senior-review.md`
   - Pay special attention to: Depends() injection, async discipline, Pydantic v2 patterns, proper error handling, type hints
   - Check the reference example at the bottom — does our code match that quality?

5. **Architecture review** — go through `skills/code-review-checklist.md` architecture checks section
   - Layer violations
   - Architectural principles per `skills/architectural-principles.md` (SOLID, KISS, DRY, YAGNI, Separation of Concerns, Coupling/Cohesion)
   - Error handling completeness
   - State management patterns

6. **Design review** (if UI changed) — run `commands/design-review.md`

7. **Fix issues** — apply fixes, categorize by severity:
   - 🔴 Must fix: type errors, lint failures, security issues, architecture violations
   - 🟡 Should fix: missing patterns (OnPush, Depends), junior-level code
   - 🟢 Nice to fix: naming improvements, minor refactors

8. **Root cause & skill feedback** — for every 🔴 and 🟡 finding:
   - **Classify:** one-off (typo, wrong variable) or pattern (missing state, wrong async, forgot loading)?
   - **If pattern:** find which skill should have caught it:
     - Missing Angular pattern → update `skills/angular-senior-review.md`
     - Missing FastAPI pattern → update `skills/fastapi-senior-review.md`
     - Missing test pattern → update `skills/angular-testing.md` or `skills/fastapi-testing.md`
     - Missing performance pattern → update `skills/performance-patterns.md`
     - Architecture issue → update `skills/code-review-checklist.md`
     - No skill covers it → add to `skills/code-review-checklist.md`
   - **If same pattern appears 3+ times:** escalate to `CLAUDE.md` "Common Mistakes To Avoid"
   - **One-offs:** just fix, no skill update needed

9. **Re-verify** — re-run automated checks and tests after fixes

10. **Commit** — `fix: <description of what was fixed>`

### Common senior-level findings
- Components missing `ChangeDetectionStrategy.OnPush`
- Using `@Input()` decorator instead of `input()` signal function
- Using `*ngIf` / `*ngFor` instead of `@if` / `@for`
- Manual subscribe without `takeUntilDestroyed`
- Services imported directly instead of using `Depends()`
- Blocking I/O inside async handlers
- Boolean flags for state instead of discriminated union signals
- Business logic in components instead of services
- Missing loading/error states
