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

## Onboarding Feature

**No new endpoints.** The onboarding flow is entirely client-side:
- Screen navigation managed by Angular Signals in `OnboardingService`
- User preferences persisted via `@capacitor/preferences` (local key-value storage)
- Mock subscription "purchase" is client-only (no server validation)

---

## AI Chat Feature

### POST /api/v1/chat

**Description:** Streams an AI chat response. Client sends full conversation state; server is stateless. Server builds a system prompt based on mode/persona, trims messages to a sliding window (last 10 pairs), injects portfolio context, and proxies to Anthropic Claude API. Response is SSE.

**Request:**
```json
{
  "mode": "onboarding | common | asset",
  "persona": "beginner | experienced",
  "messages": [
    { "role": "user | assistant", "content": "string" }
  ],
  "portfolio": {
    "holdings": [
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "quantity": 50,
        "cost_basis": 175.20,
        "current_price": 198.45,
        "value": 9922.50,
        "daily_change_percent": 2.31
      }
    ],
    "total_value": 47230.00,
    "daily_change": 312.50,
    "daily_change_percent": 0.67
  },
  "asset": {
    "ticker": "AAPL",
    "name": "Apple Inc."
  }
}
```

**`asset` field:** Required when `mode=asset`, ignored otherwise. Tells the AI which holding to focus on.

**Response (200 — SSE stream):**

Does NOT use the standard `ApiResponse[T]` envelope. Returns `text/event-stream`:

```
event: token
data: {"content": "Your"}

event: token
data: {"content": " portfolio"}

event: done
data: {}

event: error
data: {"message": "Something went wrong"}
```

**SSE event types:**

| Event | Data Shape | Description |
|---|---|---|
| `token` | `{"content": "string"}` | A streamed text chunk |
| `done` | `{}` | Stream complete |
| `error` | `{"message": "string"}` | Error during streaming |

**Onboarding end signal:** When the AI determines the portfolio is ready (onboarding mode, after 3-5 exchanges), the streamed response will contain:
```
[PORTFOLIO_READY]
<portfolio_data>
{"holdings": [...], "totalValue": 47230, ...}
</portfolio_data>
```
Client parses and strips this from the displayed message, extracts the JSON, and persists via `PortfolioService`.

**Errors (non-streaming):**
- 422 `VALIDATION_ERROR`: Invalid request body (bad mode, missing fields)
- 500 `AI_SERVICE_ERROR`: Anthropic API failure (key missing, rate limit, etc.)

**Server behavior:**
1. Validate request with Pydantic
2. Build system prompt: base personality (persona) + mode instructions + portfolio data + asset focus (if asset mode)
3. Trim `messages` to last 20 (10 pairs) — sliding window
4. Call `anthropic.messages.stream()` with system prompt + trimmed messages
5. Yield SSE events as tokens arrive
6. On completion, yield `done` event
7. On error, yield `error` event and close stream

**Configuration:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: 1024
- Temperature: 0.7
- API key: `ANTHROPIC_API_KEY` env var

---

### GET /api/v1/portfolio

**Description:** Returns the mock portfolio data. Used by dashboard and asset detail screens. In MVP, this returns hardcoded mock data that matches the Figma design values.

**Response (200):**
```json
{
  "data": {
    "holdings": [
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "quantity": 50,
        "cost_basis": 175.20,
        "current_price": 198.45,
        "value": 9922.50,
        "daily_change_percent": 1.24
      }
    ],
    "total_value": 47230.00,
    "daily_change": 312.50,
    "daily_change_percent": 0.67
  },
  "meta": { "timestamp": "2026-03-29T10:00:00Z" }
}
```

**Errors:**
- None expected (mock data always available)

---

### GET /api/v1/portfolio/{ticker}/metrics

**Description:** Returns mock market metrics for a specific asset. Used on asset detail screen.

**Response (200):**
```json
{
  "data": {
    "ticker": "AAPL",
    "pe_ratio": 32.1,
    "market_cap": "$3.04T",
    "day_range_low": 195.20,
    "day_range_high": 199.10,
    "volume": "45.2M"
  },
  "meta": { "timestamp": "2026-03-29T10:00:00Z" }
}
```

**Errors:**
- 404 `ASSET_NOT_FOUND`: Ticker not in mock data

---

## Dashboard & Asset Detail Feature

### GET /api/v1/portfolio/{ticker}/history

**Description:** Returns generated historical price data for an asset. Server produces a plausible random walk from the asset's `current_price` with ticker-specific volatility. Data is regenerated per request but seeded by ticker for visual consistency.

**Query params:**

| Param | Type | Required | Default | Values |
|---|---|---|---|---|
| range | string | no | `1M` | `1W`, `1M`, `3M`, `1Y`, `ALL` |

**Response (200):**
```json
{
  "data": {
    "ticker": "AAPL",
    "range": "1M",
    "points": [
      { "timestamp": "2026-02-28T16:00:00Z", "price": 189.30 },
      { "timestamp": "2026-03-01T16:00:00Z", "price": 191.15 },
      "..."
    ]
  },
  "meta": { "timestamp": "2026-03-30T10:00:00Z" }
}
```

**Errors:**
- 404 `ASSET_NOT_FOUND`: Ticker not in mock data
- 422 `VALIDATION_ERROR`: Invalid range value

---

### GET /api/v1/portfolio/insight

**Description:** Returns an AI-generated insight about a random portfolio holding. Server picks a random holding from mock portfolio data, sends a short prompt to Claude asking for a factual 1-2 sentence insight with a headline, and returns the structured result. Single request/response (not streaming).

**Request:** No body. No required headers.

**Response (200):**
```json
{
  "data": {
    "ticker": "NVDA",
    "asset_name": "NVIDIA Corporation",
    "headline": "NVDA MOMENTUM ALERT",
    "body": "NVIDIA is up 4.2% following the latest earnings report. Your position has grown by $1,240 this month."
  },
  "meta": { "timestamp": "2026-03-30T10:00:00Z" }
}
```

**Errors:**
- 500 `AI_SERVICE_ERROR`: Claude API failure (key missing, rate limit, etc.)

**Server behavior:**
1. Pick a random holding from `MOCK_PORTFOLIO.holdings`
2. Build a short prompt: "Give a brief, factual market insight (1-2 sentences) about {name} ({ticker}) currently at ${current_price}, {daily_change_percent}% today. Return JSON with `headline` (5 words max, ALL CAPS) and `body` fields."
3. Call Claude with `max_tokens=256`, `temperature=0.7`
4. Parse the JSON response into `PortfolioInsight`
5. Return wrapped in `ApiResponse[PortfolioInsight]`

---

*This file is updated by the prep session before client/server sessions begin.*
