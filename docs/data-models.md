# Data Models

Describes domain models for documentation and the prep session. **Pydantic models on the server are the source of truth.** TypeScript types are auto-generated from the OpenAPI spec — never hand-written.

**Workflow:**
1. Prep session defines models in this file (human-readable reference)
2. Server session implements as Pydantic models in `server/models/`
3. TypeScript types auto-generated: `cd client && npm run generate:types`
4. Client session uses generated types from `core/models/api.generated.ts`

**Rules:**
- Changes to this file must happen in the prep session
- If a field is added/removed, the Pydantic model is updated and types are regenerated
- This file is documentation — it does NOT replace the Pydantic models as source of truth

## Convention Mapping

| This doc | Python (Pydantic) | TypeScript (generated) |
|---|---|---|
| `string` | `str` | `string` |
| `number` | `float` | `number` |
| `integer` | `int` | `number` |
| `boolean` | `bool` | `boolean` |
| `string[]` | `list[str]` | `string[]` |
| `ModelName` | `ModelName` (class) | `components["schemas"]["ModelName"]` |
| `total_value` | `total_value` | auto camelCase via generation config |

---

## Common Models

### ApiResponse\<T\>

Wraps all successful responses (see `skills/api-contract-patterns.md`):

| Field | Type | Description |
|---|---|---|
| data | T | The actual payload |
| meta | Meta | Request metadata (timestamp, pagination) |

### ApiError

| Field | Type | Description |
|---|---|---|
| code | string | Machine-readable UPPER_SNAKE_CASE code |
| message | string | Human-readable description |
| details | object | Optional additional context |

---

## Domain Models

<!-- Prep session populates this section per feature -->
<!-- Each model follows this template:

### ModelName

**Description:** What it represents

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| field_name | type | yes/no | rules | what it is |

**Computed fields (derived, not stored):**
| Field | Type | Derivation |
|---|---|---|
| field_name | type | how it's computed |

-->

---

*This file is updated by the prep session before client/server sessions begin.*
