# Command: Create Feature

## Workflow
Full feature creation from task description to committed, reviewed code.

### Input
- Feature spec provided by the user in chat
- Shared contracts: `docs/api-contract.md` and `docs/data-models.md` (populated by prep session)

### Phase 1: Understand
1. Read the user's feature spec from chat
2. Read the API contract — what endpoints you build/consume
3. Read the data models — what types/interfaces to create
4. Read related existing code to understand current patterns

### Phase 2: Plan
Propose implementation approach:
- Break into TDD slices
- Identify components/services to create or reuse
- Note edge cases, loading/error/empty states

If the API contract or data models are wrong/incomplete — **stop and flag it**. Don't improvise. Only the prep session changes those files.

Present plan, wait for confirmation before coding.

### Phase 3: Implement (TDD)
Build using TDD cycles per `skills/tdd-workflow.md`. For each slice:

1. **RED** — Write a failing test that defines the expected behavior
   - Client tests: `skills/angular-testing.md` (Testing Library + Jest)
   - Server tests: `skills/fastapi-testing.md` (pytest + httpx)
2. **GREEN** — Write minimum code to make it pass
3. **REFACTOR** — Apply senior patterns, clean up

**Client senior patterns (per `skills/angular-senior-review.md`):**
- `ChangeDetectionStrategy.OnPush` on every component
- `signal()`, `computed()`, `input()`, `output()` — not decorators
- `@if` / `@for` / `@defer` control flow
- `takeUntilDestroyed()` for RxJS subscriptions
- Smart/dumb component separation
- Ionic components for all UI (per `skills/figma-to-ionic.md`)
- Design tokens from `skills/design-system.md`

**Server senior patterns (per `skills/fastapi-senior-review.md`):**
- `Depends()` for dependency injection
- `async` throughout, no blocking calls
- Pydantic v2 patterns with `Field()` descriptions
- `pydantic-settings` for configuration
- Structured logging
- Custom exception handlers

**Slicing order:** data model → service logic → API endpoint → component behavior → UI rendering

**Visual tests:** When creating a new route/screen, add a Playwright visual test for it in `e2e/visual/screens.spec.ts`. Follow the pattern in `skills/visual-snapshot-testing.md`.

### Phase 4: Quality Gate
**DO NOT COMMIT until this phase passes.**

Run `commands/post-feature.md` — the full quality gate:
1. Automated checks (lint, types, build, compile)
2. Senior code review (stack-specific)
3. Architecture review
4. Design review (if UI changed)
5. Visual snapshots (if UI changed)

Fix all 🔴 and 🟡 findings before proceeding.

### Phase 5: Commit
- Stage only the files related to this feature
- Write descriptive commit message with area prefix
- Pre-commit hook runs automated checks as final safety net
- Update task status in `.claude/context/current-task.md`

### Output
- Working feature accessible in the app
- Clean commit(s) — all automated and manual checks passing
- Updated task status
