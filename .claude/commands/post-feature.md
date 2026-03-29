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

### Phase 6: Visual Snapshots (always run)

**For existing screens** (baseline already exists):
```bash
cd client && npx playwright test --grep @visual
```
Tests compare against saved baselines. If they fail, either fix the regression or update with `--update-snapshots` if the change was intentional.

**For new screens** (no baseline yet):
1. Get the Figma screenshot: call `get_design_context` for the screen's node ID
2. Open the running app at the route (375px viewport)
3. Compare visually against the Figma screenshot — verify: layout, colors, typography, spacing, content hierarchy
4. If it doesn't match Figma → fix implementation first, do NOT create a baseline from a broken screen
5. Once it matches Figma → create the baseline:
```bash
cd client && npx playwright test --grep @visual --update-snapshots
```
6. Commit the baseline screenshot to git

**The Figma screenshot is the source of truth for new screens. Playwright baselines capture the approved implementation for regression detection going forward.**

### Phase 7: Contract Drift Check (blocking)
Verify implementation matches the shared contracts:

**If server code changed:**
1. Read `docs/api-contract.md` — for every endpoint defined:
   - Does a matching router exist with the correct path and method?
   - Does the response shape match the contract? (field names, types, nesting)
   - Are error status codes and conditions implemented as specified?
   - If streaming: does the SSE format match? (data prefix, DONE sentinel, error events)
2. Read `docs/data-models.md` — for every model defined:
   - Does a matching Pydantic model exist?
   - Do field names, types, and validation rules match?
   - Are computed fields derived as specified?

**If client code changed:**
1. Read `docs/api-contract.md` — for every endpoint the client calls:
   - Does the service call the correct path and method?
   - Does the TypeScript interface match the response shape in the contract?
   - Are error status codes handled as documented?
2. Read `docs/data-models.md` — for every model the client uses:
   - Does the TypeScript interface have matching fields? (camelCase equivalent)
   - Are types correct? (number vs string, optional vs required)

**If drift found:**
- If implementation is correct and contract is outdated → flag for prep session to update contract
- If contract is correct and implementation is wrong → fix the implementation
- NEVER silently accept drift — it breaks the parallel session model

### Phase 8: Commit
Only after all phases pass:
- Stage changed files
- Commit with area prefix and descriptive message
- Pre-commit hook runs automated checks again as final safety net

## Severity Guide
- 🔴 **Blocks commit:** lint/type errors, security issues, architecture violations, missing OnPush, blocking calls in async
- 🟡 **Fix before PR:** missing loading states, junior patterns, incomplete error handling
- 🟢 **Track for later:** naming improvements, optional performance optimizations

## Skill Feedback Loop
After fixing 🔴 and 🟡 findings, run root cause analysis (see `commands/review-and-fix.md` step 8):
- Classify: one-off or pattern?
- If pattern: update the skill that should have prevented it
- If 3+ occurrences: escalate to CLAUDE.md

## Output
- List of findings by severity
- All 🔴 and 🟡 items fixed
- Skills updated if pattern bugs found
- Clean commit with all checks passing
