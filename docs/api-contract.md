# API Contract

Single source of truth for all API endpoints. Both client and server sessions build against this spec.

**Rules:**
- Server implements exactly what's defined here
- Client consumes exactly what's defined here
- Changes to this file must happen in the prep session, not during client/server sessions
- If a session discovers the contract is wrong or incomplete, stop and flag it — don't improvise
- All patterns follow `skills/api-contract-patterns.md`

---

## Base URL

- Dev: `http://localhost:8000`
- All endpoints prefixed with `/api/v1`
- OpenAPI spec: `http://localhost:8000/openapi.json`

## Response Envelope (all endpoints)

Every response uses the standard envelope from `skills/api-contract-patterns.md`:

### Success
```json
{
  "data": { ... },
  "meta": { "timestamp": "2026-03-29T10:00:00Z" }
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### Streaming (SSE)
```
data: {"type": "chunk", "text": "..."}\n\n
data: {"type": "done", "meta": {"timestamp": "..."}}\n\n
data: {"type": "error", "error": {"code": "...", "message": "..."}}\n\n
```

---

## Type Generation

Pydantic models on the server are the source of truth. TypeScript types are auto-generated:

```bash
cd client && npm run generate:types
```

This fetches `/openapi.json` from the running server and generates `src/app/core/models/api.generated.ts`. Never hand-write TypeScript interfaces for API types — regenerate.

---

## Endpoints

<!-- Prep session populates this section per feature -->
<!-- Each endpoint follows this template:

### VERB /api/v1/path

**Description:** What it does

**Request:**
```json
{
  "field": "type — description"
}
```

**Response (200):**
```json
{
  "data": { ... },
  "meta": { "timestamp": "..." }
}
```

**Errors:**
- 400 `VALIDATION_ERROR`: when/why
- 404 `RESOURCE_NOT_FOUND`: when/why

-->

### GET /api/v1/health

**Description:** Health check (does not use envelope — simple status)

**Response (200):**
```json
{
  "status": "ok"
}
```

---

*This file is updated by the prep session before client/server sessions begin.*
