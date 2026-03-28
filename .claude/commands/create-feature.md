# Command: Create Feature

## Workflow
Full feature creation from task description to committed, reviewed code.

### Input
Read the current task from `.claude/context/current-task.md`

### Phase 1: Understand
1. Read task description, acceptance criteria, and any referenced designs
2. Read related existing code to understand current patterns
3. Identify which layers are affected (client, server, or both)

### Phase 2: Plan
Propose implementation approach:
- Which components to create/modify (follow `skills/create-angular-component.md`)
- Which services needed
- Which API endpoints needed (follow `skills/create-api-endpoint.md`)
- Data model changes (TypeScript types + Pydantic models)
- State management approach (which signals, computed values)
- Loading/error/empty states
- Edge cases

Present plan, wait for confirmation before coding.

### Phase 3: Implement
Build in small slices, following the senior patterns:

**Client code must use (per `skills/angular-senior-review.md`):**
- `ChangeDetectionStrategy.OnPush` on every component
- `signal()`, `computed()`, `input()`, `output()` — not decorators
- `@if` / `@for` / `@defer` control flow
- `takeUntilDestroyed()` for RxJS subscriptions
- Smart/dumb component separation
- Ionic components for all UI (per `skills/figma-to-ionic.md`)
- Design tokens from `skills/design-system.md`

**Server code must use (per `skills/fastapi-senior-review.md`):**
- `Depends()` for dependency injection
- `async` throughout, no blocking calls
- Pydantic v2 patterns with `Field()` descriptions
- `pydantic-settings` for configuration
- Structured logging
- Custom exception handlers

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
