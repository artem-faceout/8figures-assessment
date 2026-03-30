# 8FIGURES Assessment — AI Portfolio Companion

## What Is This Project

Mobile-first AI portfolio companion app. Users view investment portfolio, chat with AI about holdings, get contextual insights. Built as a technical assessment for Principal Engineer & Agent Orchestrator role at 8FIGURES.

## Architecture Overview

Monorepo with two workspaces:

- `client/` — Angular 20 + Capacitor 6 + Ionic (mobile-first frontend)
- `server/` — Lightweight API layer (FastAPI, Python 3.11+)

## How To Run

```bash
# Server
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Client
cd client
npm install
ng serve              # browser dev
ng build && npx cap sync && npx cap open ios   # iOS simulator
```

## Stack Decisions (DO NOT CHANGE)

|Decision          |Choice                                   |Rationale                                                      |
|------------------|-----------------------------------------|---------------------------------------------------------------|
|Frontend framework|Angular 21 (standalone components)       |Required by assessment                                         |
|Mobile shell      |Capacitor 8                              |Required by assessment                                         |
|UI components     |Ionic Framework                          |Required by assessment                                         |
|State management  |Angular Signals                          |Modern Angular default, simpler than NgRx for this scope       |
|Styling           |Ionic CSS utilities + minimal custom SCSS|Mobile-native look, no Tailwind                                |
|Backend           |FastAPI (Python)                         |Lightweight, async, auto-docs — matches 8FIGURES stack         |
|AI chat           |Anthropic Claude API via backend proxy   |Streaming via SSE, never expose API key to client              |
|Data format       |Mock JSON data served by API             |Realistic portfolio data, designed to demo financial formatting|
|TypeScript        |Strict mode ON                           |`strict: true` in tsconfig, no `any`                           |
|Linting           |ESLint + angular-eslint                  |`no-explicit-any` enforced, Angular best practices             |
|Visual testing    |Playwright                               |Screenshot snapshots at mobile viewport, catches UI regressions|
|Unit testing (FE) |Jest + Testing Library                   |Behavior-focused component tests, TDD workflow                 |
|Unit testing (BE) |pytest + httpx                           |Async tests, 80% coverage threshold                           |
|API contract      |Response envelope + typed SSE events     |`skills/api-contract-patterns.md`, Pydantic source of truth            |
|Type generation   |openapi-typescript                       |Server OpenAPI → client TS types, zero manual sync                    |
|Design system     |Ionic CSS variables + custom tokens      |Defined in `.claude/skills/design-system.md` and `theme/variables.scss`|

## Coding Conventions

### Angular / TypeScript

- Standalone components only (no NgModules)
- Signals for reactive state, RxJS only for HTTP/streams
- All types in dedicated `.model.ts` files — never inline
- Component file naming: `feature-name.component.ts` / `.html` / `.scss`
- Services are injectable at root level unless feature-scoped
- Use `inject()` function, not constructor injection
- Template-driven forms for simple cases, reactive forms for complex
- All money values: `number` in model, formatted in template with pipes
- No `any` anywhere — if unsure, use `unknown` and narrow

### Ionic / Mobile

- Use Ionic components (`ion-card`, `ion-list`, `ion-item`) for all UI — no raw HTML divs for layout
- Always test in both browser AND iOS simulator — Capacitor WebView can behave differently
- Safe area handling: use Ionic's built-in support, don't manually add padding
- Touch targets minimum 44x44pt
- Financial numbers: right-aligned, monospace where appropriate
- Gain = gold (#F7931A) with glow, Loss = red (#EF4444), Neutral = medium text (#888)

### Python / Backend

- FastAPI with async endpoints
- Pydantic models for all request/response schemas
- CORS configured for local dev (localhost:4200 and capacitor://localhost)
- Endpoints prefixed with `/api/v1/`
- AI proxy endpoint streams SSE back to client

### Git

- Atomic commits, one logical change per commit
- Prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`
- Commit message explains WHY, not just WHAT
- No generated code in commit messages

## File Organization

```
client/src/app/
├── core/              # Singleton services, guards, interceptors
│   ├── services/      # PortfolioService, AiChatService, etc.
│   ├── models/        # All TypeScript interfaces/types
│   └── interceptors/  # HTTP interceptors
├── features/          # Feature modules (lazy-loaded routes)
│   ├── dashboard/     # Portfolio dashboard screen
│   ├── chat/          # AI chat screen
│   └── insights/      # AI insights (if time permits)
├── shared/            # Reusable dumb components, pipes, directives
│   ├── components/    # PortfolioCard, HoldingRow, etc.
│   └── pipes/         # Currency, percentage, gain/loss formatting
└── app.routes.ts      # Top-level routing
```

## Common Mistakes To Avoid

- DO NOT use `any` in TypeScript — ESLint will catch it, fix before committing
- DO NOT put business logic in components — use services
- DO NOT skip Ionic components for plain HTML — this is a mobile app, Ionic handles platform differences
- DO NOT hardcode API URLs — use environment files
- DO NOT commit API keys — use .env files, .gitignore them
- DO NOT make the AI chat call the API directly from Angular — always proxy through server
- DO NOT forget to test Capacitor build after major UI changes — WebView ≠ browser
- DO NOT use px for spacing — use Ionic CSS utilities or rem
- DO NOT commit feature code without running `commands/post-feature.md` quality gate first
- DO NOT do heavy computation on the main thread — use Web Workers for >5ms operations
- DO NOT update signals per-chunk during streaming — batch via requestAnimationFrame
- DO NOT use sync I/O in async FastAPI handlers — use aiofiles or asyncio.to_thread
- DO NOT fix a pattern bug without updating the skill that should have prevented it — see `commands/fix-bug.md`
- DO NOT return raw data from endpoints — always wrap in `ApiResponse[T]` envelope per `skills/api-contract-patterns.md`
- DO NOT hand-write TypeScript interfaces for API types — regenerate from OpenAPI: `cd client && npm run generate:types`

## AI Agent Workflow

Every feature goes through a pipeline of **specialized agents** (`.claude/agents/`), each with a defined role, tool restrictions, and review scope. Commands (`.claude/commands/`) define the workflows; agents execute them.

### Agent roster

| Agent | Role | Tools | When |
|-------|------|-------|------|
| `prep-session` | Architecture — contracts, models, PRDs, parallel strategy | Read, Write, Edit, Grep, Glob, Bash | Before any feature work |
| `feature-builder` | Implementation — TDD vertical slices from PRD | All | During feature development |
| `code-reviewer` | Read-only senior review — patterns, architecture, perf | Read, Grep, Glob, Bash | After implementation |
| `design-reviewer` | Read-only design review — Figma, tokens, mobile, formatting | Read, Grep, Glob, Bash | When UI changed |
| `quality-gate` | Orchestrator — runs checks, delegates to reviewers, reports | Read, Grep, Glob, Bash, Agent | Before committing |
| `debugger` | Diagnosis and fix — systematic root cause analysis | Read, Write, Edit, Grep, Glob, Bash | When something breaks |

### Multi-session model
1. **Prep session** (`@prep-session` + `commands/prepare-feature.md`) — takes feature descriptions, produces API contract (`docs/api-contract.md`), data models (`docs/data-models.md`), and execution strategy (parallel vs sequential based on file overlap analysis)
2. **Feature sessions** (`@feature-builder` + `commands/create-feature.md`) — one per feature, full vertical slice (server + client). Agent reads shared contracts and PRD, executes TDD slices.
3. **Quality gate** (`@quality-gate` + `commands/post-feature.md`) — orchestrates `@code-reviewer` and `@design-reviewer` in parallel, runs automated checks, aggregates pass/fail verdict.
4. **Parallel execution** — when prep session confirms safe via overlap matrix, feature builders run in separate git worktrees. Merge order by dependency (least-dependent first).

Feature sessions must NOT modify contracts or touch files outside their assigned scope — if something is wrong, stop and flag it.

### Within each feature session

Feature sessions receive a finalized PRD from the prep session. The spec is already decided — the feature session's job is to EXECUTE, not re-plan.

1. **Confirm** — Read PRD + contracts, confirm understanding in 2-3 sentences, start immediately. DO NOT brainstorm, DO NOT create a new plan, DO NOT produce new spec documents.
1. **Implement (TDD)** — RED: write failing test → GREEN: make it pass → REFACTOR: apply senior patterns. Per `skills/tdd-workflow.md`
1. **Quality Gate** — Invoke `@quality-gate` which runs `commands/post-feature.md`: tests, lint, types, build, then delegates to `@code-reviewer` and `@design-reviewer` in parallel
1. **Verify** — All tests pass, build clean, runs in browser, types are strict

### Agent delegation model

```
User describes feature
        │
        ▼
  @prep-session ──────► docs/prd-*.md + contracts
        │
        ▼
  @feature-builder ───► TDD implementation (per PRD)
        │
        ▼
  @quality-gate ──┬──► automated checks (tests, lint, types, build)
                  ├──► @code-reviewer (patterns, architecture, perf)
                  ├──► @design-reviewer (Figma, tokens, mobile)
                  └──► contract drift check
                  │
                  ▼
            PASS / FAIL verdict
        │
        ▼
  @debugger ◄──── (only if something breaks)
```

### Superpowers skill overrides for feature sessions

When a feature session has a PRD from prep:
- **brainstorming skill**: SKIP. The prep session already brainstormed. The spec is finalized.
- **writing-plans skill**: SKIP. The PRD IS the plan. Do not produce another plan document.
- **TDD skill**: USE. This is the implementation discipline — always follow it.
- **debugging skill**: USE. If something breaks during implementation, debug properly.
- **verification skill**: USE. Always verify before claiming done.

If no PRD exists (ad-hoc feature), all skills apply normally.

## Non-Obvious Context

- This is an ASSESSMENT — code quality and architecture matter more than feature count
- The evaluators will read CLAUDE.md, .claude/ skills, and docs/ FIRST, code second
- Pipeline sophistication (this file + skills + workflows) is 50% of the grade
- Financial data formatting is a design signal — get precision and alignment right
- Streaming AI responses is "table-stakes" per the brief — must work smoothly
