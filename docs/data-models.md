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

## Portfolio Models

### Holding

**Description:** A single investment position in the user's portfolio. Created during onboarding chat, served by portfolio endpoint, displayed on dashboard and asset detail.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| ticker | string | yes | 1–10 chars, uppercase | Asset ticker symbol (e.g., "AAPL") |
| name | string | yes | non-empty | Full asset name (e.g., "Apple Inc.") |
| exchange | string | yes | non-empty | Exchange name (e.g., "NASDAQ") |
| quantity | number | yes | > 0 | Number of shares/units held |
| cost_basis | number | yes | >= 0 | Average cost per share |
| current_price | number | yes | >= 0 | Current market price per share |
| value | number | yes | >= 0 | Total position value (quantity × current_price) |
| daily_change_percent | number | yes | — | Daily price change as percentage |

**Derived fields (client-side):**
- `gain_loss = value - (quantity × cost_basis)`
- `gain_loss_percent = gain_loss / (quantity × cost_basis) × 100`

### Portfolio

**Description:** Complete portfolio state. Persisted to localStorage after onboarding, served by portfolio endpoint.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| holdings | Holding[] | yes | non-empty | List of investment positions |
| total_value | number | yes | >= 0 | Sum of all holding values |
| daily_change | number | yes | — | Total dollar change today |
| daily_change_percent | number | yes | — | Total percentage change today |

### AssetMetrics

**Description:** Market metrics for a single asset. Mock data, not user-provided. Used on asset detail screen.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| ticker | string | yes | matches a Holding ticker | Asset identifier |
| pe_ratio | number | no | — | Price-to-earnings ratio |
| market_cap | string | yes | non-empty | Human-readable market cap (e.g., "$3.04T") |
| day_range_low | number | yes | >= 0 | Day's lowest price |
| day_range_high | number | yes | >= day_range_low | Day's highest price |
| volume | string | yes | non-empty | Human-readable volume (e.g., "45.2M") |

---

## Chat Models

### ChatMessage

**Description:** A single message in a chat conversation. Used in API request body.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| role | string | yes | `"user"` \| `"assistant"` | Message sender |
| content | string | yes | non-empty | Message text content |

### ChatRequest

**Description:** Request body for the chat endpoint. Client sends full state; server is stateless.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| mode | string | yes | `"onboarding"` \| `"common"` \| `"asset"` | Chat mode |
| persona | string | yes | `"beginner"` \| `"experienced"` | User's investment profile |
| messages | ChatMessage[] | yes | 0–100 items | Conversation history |
| portfolio | Portfolio | yes | — | Current portfolio state |
| asset | AssetContext \| null | no | required if mode=asset | Focused asset |

### AssetContext

**Description:** Identifies which asset the chat should focus on in asset mode.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| ticker | string | yes | non-empty | Asset ticker symbol |
| name | string | yes | non-empty | Asset full name |

### ChatConfig (Client-Only)

**Description:** Configuration passed to ChatPage component. Not sent to server — used to configure the chat UI and build request params. Defined in `core/models/chat.model.ts`.

| Field | Type | Required | Description |
|---|---|---|---|
| mode | `'onboarding'` \| `'common'` \| `'asset'` | yes | Chat mode |
| persona | `'beginner'` \| `'experienced'` | yes | User persona |
| asset | `{ ticker: string; name: string }` \| undefined | no | Asset context for asset mode |

### StorageKeys (additions)

| Key | Value Type | Description |
|---|---|---|
| `8f_portfolio` | JSON string | Serialized Portfolio object |

---

## Dashboard & Asset Detail Models

### PricePoint

**Description:** A single data point in a price history series. Generated algorithmically from current price with random walk.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| timestamp | datetime | yes | valid ISO 8601 | Point in time for this price |
| price | number | yes | >= 0 | Price at this timestamp |

### PriceHistory

**Description:** Historical price data for an asset over a given time range. Generated by server using random walk from `current_price` with per-asset volatility.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| ticker | string | yes | matches a Holding ticker | Asset identifier |
| range | string | yes | `"1W"` \| `"1M"` \| `"3M"` \| `"1Y"` \| `"ALL"` | Time range |
| points | PricePoint[] | yes | non-empty | Ordered price points (oldest first) |

**Generation rules:**
- Walk backward from `current_price` using per-asset volatility: BTC ~3% daily, VOO ~0.5%, stocks ~1-1.5%
- Points per range: 1W=7, 1M=30, 3M=90, 1Y=252, ALL=500
- Seeded by ticker name for visual consistency within a server restart

### PortfolioInsight

**Description:** AI-generated insight about a portfolio holding. Server picks a random holding, asks Claude for a brief factual market insight. Used on dashboard in an async-loaded card.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| ticker | string | yes | matches a Holding ticker | Which asset the insight is about |
| asset_name | string | yes | non-empty | Full asset name |
| headline | string | yes | non-empty, ~5 words | Short ALL-CAPS headline (e.g., "NVDA MOMENTUM ALERT") |
| body | string | yes | non-empty, 1-2 sentences | Factual insight about the asset |

---

*This file is updated by the prep session before client/server sessions begin.*
