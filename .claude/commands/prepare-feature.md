# Command: Prepare Feature

## When to use
In the prep session, before launching client and server sessions in parallel.

## Input
A feature description from the user — can be a brief, a ticket, a conversation, or just a sentence.

## Workflow

### 1. Understand the Feature
- What does the user see? (screens, interactions, data)
- What data flows between client and server?
- What external services are involved? (Anthropic API, etc.)
- What are the edge cases? (empty state, errors, loading)

### 2. Define Data Models
Update `docs/data-models.md` with all models this feature needs:
- Field names, types, required/optional, validation rules
- Computed/derived fields and how they're calculated
- Use the template format in the file

**Check:** Do any existing models need changes? Don't duplicate — extend.

### 3. Define API Contract
Update `docs/api-contract.md` with all endpoints this feature needs:
- Path, method, description
- Request body (if POST/PUT) with exact field shapes
- Response body with exact field shapes (referencing data models)
- Error responses and when they occur
- Streaming format (if SSE endpoint)

**Check:** Does this endpoint already exist? Don't duplicate — extend or note the change.

### 4. Write Client Task Spec
Update `.claude/context/client-task.md`:
- **Scope:** which screens, components, services to build
- **Dependencies:** which endpoints from api-contract.md, which models from data-models.md
- **Implementation slices:** ordered TDD slices, following the pattern:
  1. TypeScript interfaces from data-models.md
  2. Service that calls the API endpoint
  3. Component that uses the service
  4. UI rendering with Ionic components
  5. Financial formatting, gain/loss colors
  6. Loading/error/empty states
  7. Streaming display (if applicable)
- **Acceptance criteria:** concrete checklist of what "done" looks like
- **Notes:** design references, edge cases, anything non-obvious

### 5. Write Server Task Spec
Update `.claude/context/server-task.md`:
- **Scope:** which endpoints, services, models to build
- **Dependencies:** which endpoints from api-contract.md, which models from data-models.md
- **Implementation slices:** ordered TDD slices, following the pattern:
  1. Pydantic models from data-models.md
  2. Mock data / data layer
  3. Service with business logic
  4. Router with endpoint(s)
  5. Error handling (custom exceptions, edge cases)
  6. Streaming (if applicable)
- **Acceptance criteria:** concrete checklist of what "done" looks like
- **Notes:** external API details, data constraints, anything non-obvious

### 6. Review & Confirm
Present to the user:
- Summary of what was defined
- Data models (fields and types)
- API endpoints (paths and shapes)
- Client slices (count and scope)
- Server slices (count and scope)

Wait for user approval before they launch client/server sessions.

## Output
- `docs/data-models.md` — updated with feature models
- `docs/api-contract.md` — updated with feature endpoints
- `.claude/context/client-task.md` — ready for client session
- `.claude/context/server-task.md` — ready for server session
- User has reviewed and approved

## Critical Rule
Client and server sessions must NOT modify the contract or data models. If they discover something is wrong or missing, they stop and flag it. Only the prep session changes these files.
