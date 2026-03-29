# Command: Prepare Feature

## When to use
In the prep session, before launching feature sessions. Can prepare one feature or multiple features at once.

## Input
Feature descriptions from the user — can be briefs, tickets, conversations, or just sentences. Can be one feature or several.

## Workflow

### 1. Understand the Feature(s)
For each feature:
- What does the user see? (screens, interactions, data)
- What data flows between client and server?
- What external services are involved? (Anthropic API, etc.)
- What are the edge cases? (empty state, errors, loading)

### 2. Define Data Models
Update `docs/data-models.md` with all models the feature(s) need:
- Field names, types, required/optional, validation rules
- Computed/derived fields and how they're calculated
- Use the template format in the file

**Check:** Do any existing models need changes? Don't duplicate — extend.

### 3. Define API Contract
Update `docs/api-contract.md` with all endpoints the feature(s) need:
- Path, method, description
- Request body (if POST/PUT) with exact field shapes
- Response body with exact field shapes (referencing data models)
- Error responses and when they occur
- Streaming format (if SSE endpoint)

**Check:** Does this endpoint already exist? Don't duplicate — extend or note the change.

### 4. Execution Strategy (if multiple features)
When preparing 2+ features, analyze whether they can be built in parallel or must be sequential.

#### File Overlap Analysis
For each feature, list every file that will be created or modified:

**Server files:**
- `models/<name>.py`
- `routers/<name>.py`
- `services/<name>_service.py`
- `data/<name>.py`
- `tests/test_<name>.py`
- `main.py` (router registration — always shared)

**Client files:**
- `features/<name>/` (component, spec, html, scss)
- `core/services/<name>.service.ts`
- `core/models/<name>.model.ts`
- `shared/components/<name>/` (if new shared component)
- `shared/pipes/<name>.pipe.ts` (if new pipe)
- `app.routes.ts` (route registration — always shared)

Then build the overlap matrix:

```
              Feature A    Feature B    Overlap?
models/       portfolio.py chat.py      ✅ No overlap
routers/      portfolio.py chat.py      ✅ No overlap
services/     portfolio_   ai_service   ✅ No overlap
features/     dashboard/   chat/        ✅ No overlap
shared/pipes/ currency     currency     ❌ CONFLICT
app.routes.ts ✏️ adds route ✏️ adds route  ⚠️ Trivial merge
main.py       ✏️ adds router ✏️ adds router ⚠️ Trivial merge
```

#### Decision Rules

**Safe to parallelize** when:
- Feature-specific files are in separate directories (different `features/`, different `routers/`)
- Shared file changes are one-liners (adding a route, registering a router)
- No feature depends on another feature's output

**Must be sequential** when:
- Both features modify the same model or service
- Feature B depends on Feature A's data (e.g., chat needs portfolio data to exist)
- Both features create the same shared component or pipe
- Merge conflicts would be non-trivial (same function, same template section)

**Dependency ordering:** If Feature B reads data that Feature A creates, build A first. Feature A merges to main, Feature B branches from updated main.

#### Parallel Setup (when safe)
Recommend to user:
1. Commit contracts to main
2. Create worktree branches: `git worktree add ../feature-a -b feature/feature-a` and `git worktree add ../feature-b -b feature/feature-b`
3. Open separate Claude Code terminals in each worktree
4. Provide feature spec in each chat — agent reads contracts from `docs/`
5. Each session follows `create-feature.md` independently

#### Merge Strategy
1. Merge the feature with fewer shared-file changes first (less conflict surface)
2. If equal, merge the simpler feature first
3. After first merge to main, rebase second branch: `git rebase main`
4. Resolve trivial conflicts (`app.routes.ts`, `main.py`)
5. Run full test suite on main after all merges
6. Delete worktrees: `git worktree remove ../feature-a`

### 5. Review & Confirm
Present to the user:
- Data models (fields and types)
- API endpoints (paths and shapes)
- Execution strategy: parallel (with overlap matrix) or sequential (with reasoning)
- If parallel: merge order recommendation

Wait for user approval before they launch feature sessions.

## Output
- `docs/data-models.md` — updated with feature models
- `docs/api-contract.md` — updated with feature endpoints
- Execution strategy with file overlap analysis
- User has reviewed and approved

## How Feature Sessions Use This
Each session reads `docs/api-contract.md` and `docs/data-models.md` as shared contracts. The user provides the feature spec directly in chat — no task files needed. Each session follows `commands/create-feature.md`.

## Critical Rules
- Feature sessions must NOT modify `docs/api-contract.md` or `docs/data-models.md`. If they discover something is wrong or incomplete, they stop and flag it. Only the prep session changes these files.
- Feature sessions must NOT modify files outside their feature's scope (per the overlap analysis). If they need a shared component that doesn't exist yet, flag it for the prep session to assign ownership.
