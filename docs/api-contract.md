# API Contract

Single source of truth for all API endpoints. Both client and server sessions build against this spec.

**Rules:**
- Server implements exactly what's defined here
- Client consumes exactly what's defined here
- Changes to this file must happen in the prep session, not during client/server sessions
- If a session discovers the contract is wrong or incomplete, stop and flag it — don't improvise

---

## Base URL

- Dev: `http://localhost:8000`
- All endpoints prefixed with `/api/v1`

## Common Response Patterns

### Error Response
```json
{
  "detail": "Human-readable error message"
}
```
Status codes: 400 (bad request), 404 (not found), 422 (validation), 500 (server error)

### Streaming Response
Media type: `text/event-stream`
Format: `data: {"text": "chunk"}\n\n`
Termination: `data: [DONE]\n\n`
Error mid-stream: `data: {"error": "message"}\n\n`

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
  "field": "type — description"
}
```

**Errors:**
- 400: when/why
- 404: when/why

-->

### GET /api/v1/health

**Description:** Health check

**Response (200):**
```json
{
  "status": "ok"
}
```

---

*This file is updated by the prep session before client/server sessions begin.*
