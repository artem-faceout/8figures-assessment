# Command: Create Feature

## Workflow
Full feature creation from task description to committed, reviewed code.

### Input
- Feature PRD from prep session (`docs/prd-<feature>.md`) — OR — ad-hoc spec from user in chat
- Shared contracts: `docs/api-contract.md` and `docs/data-models.md` (populated by prep session)

### Phase 1: Confirm (not re-plan)

**If a PRD exists from prep session (normal path):**
1. Read the PRD — it contains the implementation manifest (files to create/modify, TDD slice order, edge cases)
2. Skim the API contract and data models for the endpoints/types this feature touches
3. Confirm understanding in 2-3 sentences: "Building X, creating files Y, Z. Starting with slice 1."
4. **DO NOT brainstorm.** The spec is finalized. DO NOT create a new plan document. The PRD IS the plan.
5. If the contract or models are wrong/incomplete — **stop and flag it**. Don't improvise.
6. Proceed directly to Phase 2 (Implement).

**If NO PRD exists (ad-hoc feature):**
1. Read the user's feature spec from chat
2. Read the API contract and data models
3. Read related existing code to understand current patterns
4. Propose TDD slices, identify components/services, note edge cases
5. Present plan, wait for confirmation before coding

### Phase 2: Implement (TDD)
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
- Fixed header/footer layout for full-screen views (per `skills/layout-patterns.md`)

**Server senior patterns (per `skills/fastapi-senior-review.md`):**
- `Depends()` for dependency injection
- `async` throughout, no blocking calls
- Pydantic v2 patterns with `Field()` descriptions
- `pydantic-settings` for configuration
- Structured logging
- Custom exception handlers

**Slicing order:** data model → service logic → API endpoint → component behavior → UI rendering

**Visual tests:** When creating or modifying any route/screen, write a Playwright visual test in `e2e/visual/` during implementation. Follow `skills/visual-snapshot-testing.md`. Figma comparison and baseline creation happen as part of `commands/post-feature.md` Phase 6.

### Phase 3: Quality Gate
**DO NOT COMMIT until this phase passes.**

Run `commands/post-feature.md` — the full quality gate:
1. Automated checks (lint, types, build, compile)
2. Senior code review (stack-specific)
3. Architecture review
4. Design review (if UI changed)
5. Visual snapshots (if UI changed)

Fix all 🔴 and 🟡 findings before proceeding.

### Phase 4: Commit
- Stage only the files related to this feature
- Write descriptive commit message with area prefix
- Pre-commit hook runs automated checks as final safety net
- Update task status in `.claude/context/current-task.md`

### Output
- Working feature accessible in the app
- Clean commit(s) — all automated and manual checks passing
- Updated task status
