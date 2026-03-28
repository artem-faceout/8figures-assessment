# Command: Post-Feature Quality Gate

## When to use
After a feature is implemented and before committing. This is the full quality gate — automated checks + senior review + design review + visual snapshots.

## Workflow

### Phase 1: Tests (blocking)
All tests must pass. If any fail, fix before continuing.

```bash
# Client
cd client && npx jest                   # All unit tests
cd client && npx jest --coverage        # Verify >80% coverage on business logic

# Server
cd server && source .venv/bin/activate
pytest -v                               # All tests
pytest --cov                            # Verify >80% coverage
```

### Phase 2: Automated Checks (blocking)
These must all pass. If any fail, fix before continuing.

```bash
# Client
cd client && ng lint                    # ESLint
cd client && npx tsc --noEmit           # TypeScript strict
cd client && ng build                   # Production build

# Server
cd server && source .venv/bin/activate
python -m py_compile main.py            # Syntax check
# Compile-check all changed .py files
```

### Phase 3: Senior Code Review (blocking)
Run the stack-specific review for all changed code. Every item must pass.

**If client code changed:**
1. Open `skills/angular-senior-review.md`
2. Check every item against the changed files
3. Key signals to verify:
   - `ChangeDetectionStrategy.OnPush` on every component
   - `input()` / `output()` functions (not decorators)
   - `@if` / `@for` / `@defer` control flow (not `*ngIf` / `*ngFor`)
   - `computed()` for derived state
   - `takeUntilDestroyed()` for RxJS cleanup
   - Smart/dumb component separation
   - No business logic in templates

**If server code changed:**
1. Open `skills/fastapi-senior-review.md`
2. Check every item against the changed files
3. Key signals to verify:
   - `Depends()` for injection (not direct imports)
   - `async` throughout (no blocking calls)
   - Pydantic v2 patterns (`Field()`, `model_validator`, `ConfigDict`)
   - Settings via `pydantic-settings`
   - Structured logging (no `print()`)
   - Proper error handling with custom exceptions

### Phase 4: Architecture & Performance Review (blocking)
Run the architecture section of `skills/code-review-checklist.md`:
- Layer violations (component → service → data, never backwards)
- Single responsibility
- State management (discriminated unions, computed for derived state)
- Error handling completeness (loading/error/success states)

Run performance checklist from `skills/performance-patterns.md`:
- No heavy computation on main thread (use Web Workers if >5ms)
- User input debounced, lists virtualized, streaming batched
- Server async discipline, client reuse, background tasks

### Phase 5: Design Review (if UI changed)
Run `commands/design-review.md`:
- Ionic component mapping correct
- Design system tokens used (not hardcoded values)
- Financial formatting correct
- Loading/empty/error states present
- Mobile viewport tested (375px)

### Phase 6: Visual Snapshots (if UI changed)
```bash
cd client && npx playwright test --grep @visual
```
- If new screen: baselines created automatically, review them
- If existing screen: compare against baseline, update if intentional

### Phase 7: Commit
Only after all phases pass:
- Stage changed files
- Commit with area prefix and descriptive message
- Pre-commit hook runs automated checks again as final safety net

## Severity Guide
- 🔴 **Blocks commit:** lint/type errors, security issues, architecture violations, missing OnPush, blocking calls in async
- 🟡 **Fix before PR:** missing loading states, junior patterns, incomplete error handling
- 🟢 **Track for later:** naming improvements, optional performance optimizations

## Output
- List of findings by severity
- All 🔴 and 🟡 items fixed
- Clean commit with all checks passing
