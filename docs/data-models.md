# Data Models

Single source of truth for all domain models. Server creates Pydantic models from this. Client creates TypeScript interfaces from this.

**Rules:**
- Same field names on both sides (snake_case in Python, camelCase in TypeScript — standard convention mapping)
- Same types, same validation rules
- Changes to this file must happen in the prep session
- If a field is added/removed, both sides must update

## Convention Mapping

| This doc | Python (Pydantic) | TypeScript |
|---|---|---|
| `string` | `str` | `string` |
| `number` | `float` | `number` |
| `integer` | `int` | `number` |
| `boolean` | `bool` | `boolean` |
| `string[]` | `list[str]` | `string[]` |
| `ModelName` | `ModelName` (class) | `ModelName` (interface) |
| `total_value` | `total_value` | `totalValue` |

---

## Models

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
