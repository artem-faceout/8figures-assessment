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

### Onboarding (Client-Only)

**These models have NO server-side Pydantic equivalents.** They are client-only types defined in `core/models/onboarding.model.ts`. Documented here for cross-session reference.

#### OnboardingState

**Description:** Tracks onboarding flow progression and user choices. Managed by `OnboardingService` using Signals.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| current_step | OnboardingStep | yes | 0–3 | Current screen index |
| investment_profile | InvestmentProfile \| null | no | enum | User's selection on Bridge screen |
| is_complete | boolean | yes | — | Whether onboarding has been finished |

#### OnboardingStep (enum)

| Value | Label | Description |
|---|---|---|
| 0 | Hook | Value proposition screen |
| 1 | Promise | AI companion demo screen |
| 2 | Bridge | Investment profile selection |
| 3 | Paywall | Subscription gate |

#### InvestmentProfile (enum)

| Value | Description |
|---|---|
| `'experienced'` | User has existing investments |
| `'beginner'` | User is new to investing |

#### StorageKeys (constants)

| Key | Value Type | Description |
|---|---|---|
| `8f_onboarding_complete` | `'true'` \| absent | Onboarding finished flag |
| `8f_investment_profile` | `'experienced'` \| `'beginner'` | Selected profile |
| `8f_subscription_status` | `'trial'` \| `'active'` \| `'none'` | Mock subscription state |

---

*This file is updated by the prep session before client/server sessions begin.*
