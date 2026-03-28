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

### 4. Review & Confirm
Present to the user:
- Summary of what was defined
- Data models (fields and types)
- API endpoints (paths and shapes)

Wait for user approval before they launch client/server sessions.

## Output
- `docs/data-models.md` — updated with feature models
- `docs/api-contract.md` — updated with feature endpoints
- User has reviewed and approved

## How Client/Server Sessions Use This
Each session reads `docs/api-contract.md` and `docs/data-models.md` as shared contracts. The user provides the feature spec directly in chat — no task files needed.

## Critical Rule
Client and server sessions must NOT modify the contract or data models. If they discover something is wrong or incomplete, they stop and flag it. Only the prep session changes these files.
