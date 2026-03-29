# Skill: Code Review Checklist

## When to use
After implementing any feature, before committing. This is the top-level checklist — it delegates to stack-specific reviews for depth.

## Review Flow

1. **Surface checks** (this file) — lint, types, formatting, obvious issues
2. **Stack-specific review** — run the relevant skill:
   - Angular/Ionic code → `skills/angular-senior-review.md`
   - FastAPI/Python code → `skills/fastapi-senior-review.md`
3. **Architecture check** (bottom of this file) — layer violations, responsibility, patterns
4. **Design check** — if UI changed, run `commands/design-review.md`

## Surface Checks

### TypeScript / Angular
- [ ] `ng lint` passes clean — zero warnings, zero errors
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] No `any` types anywhere — search for `any` in all .ts files
- [ ] All components are standalone (no NgModules)
- [ ] Imports are clean (no unused imports)

### Ionic / Mobile
- [ ] All UI uses Ionic components — no raw HTML divs for layout
- [ ] Touch targets are 44x44pt minimum
- [ ] Financial numbers formatted per `skills/financial-data-formatting.md`
- [ ] Gain/loss colors correct (green positive, red negative)

### Backend
- [ ] `python -m py_compile` passes on all changed Python files
- [ ] All endpoints use Pydantic models for request/response
- [ ] No API keys in source code
- [ ] Type hints on every function

### General
- [ ] No `console.log` / `print()` left in code
- [ ] No commented-out code
- [ ] No TODO comments without a linked task
- [ ] File naming follows convention
- [ ] Git commit message is descriptive with area prefix

## Architecture Checks

### Layer Violations
- [ ] Components don't call data layer directly — they go through services
- [ ] Services don't import from components
- [ ] Dumb components (shared/) don't inject services
- [ ] Routers don't contain business logic — they call services
- [ ] Services don't import from routers

### Architectural Principles
Run through `skills/architectural-principles.md` review checklist (items 1–10). Key checks:
- [ ] **KISS** — no unnecessary complexity or premature abstraction
- [ ] **Single Responsibility** — each component/service/router does ONE thing
- [ ] **Separation of Concerns** — logic lives in the correct layer
- [ ] **DRY (rule of three)** — real duplication extracted, not premature
- [ ] **YAGNI** — no speculative code or unused abstractions
- [ ] **Open/Closed** — new variants don't require editing existing working code
- [ ] **Dependency Inversion** — dependencies are swappable for testing
- [ ] **Coupling/Cohesion** — features don't cross-import, modules are focused

### Error Handling
- [ ] Every HTTP call has error handling (client and server side)
- [ ] User sees meaningful feedback on errors — not blank screens or console errors
- [ ] Streaming errors handled gracefully (error event + clean termination)

### State Management
- [ ] No global mutable state — everything flows through signals or DI
- [ ] No redundant state — if it can be derived, use `computed()`
- [ ] Loading/error/success states modeled explicitly — not boolean flags
  - **Good:** `state = signal<'idle' | 'loading' | 'error' | 'success'>('idle')`
  - **Bad:** `isLoading = signal(false); hasError = signal(false);`
