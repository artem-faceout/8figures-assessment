# PRD Update 001: Device-Based Portfolio Persistence

**Parent PRD:** `docs/prd-ai-agent.md`
**Affects:** `docs/api-contract.md`, `docs/data-models.md`, server files only

---

## Change Summary

Replace client-only localStorage portfolio persistence with server-side in-memory storage keyed by anonymous device ID. No auth, no database — just a UUID per device and a Python dict on the server.

---

## Device ID Mechanism

1. Client generates a UUID v4 on first launch, stores in localStorage as `8f_device_id`
2. Every API request includes header: `X-Device-ID: <uuid>`
3. Server extracts device ID from header, uses it as key for in-memory portfolio storage
4. If header is missing, server returns 400 error (except for `/api/v1/health`)

---

## API Contract Changes

### NEW: POST /api/v1/portfolio

**Description:** Saves the user's portfolio after onboarding chat. Overwrites any existing portfolio for this device.

**Headers:**
- `X-Device-ID: <uuid>` (required)

**Request:**
```json
{
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
}
```

**Response (201):**
```json
{
  "data": { "saved": true },
  "meta": { "timestamp": "2026-03-29T10:00:00Z" }
}
```

**Errors:**
- 400 `MISSING_DEVICE_ID`: No X-Device-ID header
- 422 `VALIDATION_ERROR`: Invalid portfolio data

### CHANGED: GET /api/v1/portfolio

**Was:** Always returns hardcoded mock data.

**Now:** Returns this device's saved portfolio if it exists, otherwise falls back to mock data.

**Headers:**
- `X-Device-ID: <uuid>` (required)

**Response (200):** Same shape as before. Source changes:
1. If device has a saved portfolio → return it
2. If not → return mock data (existing behavior)

### CHANGED: POST /api/v1/chat

**Add header requirement:**
- `X-Device-ID: <uuid>` (required)

Server uses this to look up the device's portfolio from memory. If the request body also contains portfolio data, the request body takes precedence (client always sends current state).

No behavioral change to the chat logic itself — this is just for consistency and future use.

### UNCHANGED: GET /api/v1/portfolio/{ticker}/metrics

Still returns mock data. No device ID needed (metrics are the same for all users).

---

## Server Implementation

### New file: `server/services/portfolio_store.py`

In-memory portfolio store. Simple module-level dict:

```python
from server.models.portfolio import Portfolio

_store: dict[str, Portfolio] = {}

def save_portfolio(device_id: str, portfolio: Portfolio) -> None:
    _store[device_id] = portfolio

def get_portfolio(device_id: str) -> Portfolio | None:
    return _store.get(device_id)
```

No class needed. Module-level state is fine for a single-process MVP.

### Modified: `server/routers/portfolio.py`

- GET handler: read `X-Device-ID` header → `portfolio_store.get_portfolio(device_id)` → return saved or fallback to mock
- NEW POST handler: read `X-Device-ID` header → validate body → `portfolio_store.save_portfolio(device_id, data)` → return 201

### Modified: `server/routers/chat.py`

- Read `X-Device-ID` header (for consistency, log it, but chat still uses request body portfolio)

### New test: `server/tests/test_portfolio_store.py`

- Test save + retrieve by device ID
- Test unknown device ID returns None
- Test overwrite existing portfolio

### Modified: `server/tests/test_portfolio.py`

- Test GET with saved portfolio returns saved data
- Test GET without saved portfolio returns mock fallback
- Test POST saves and subsequent GET returns it
- Test missing X-Device-ID returns 400

---

## Client Impact (for client session reference)

The client session should be aware of these changes but the primary work is on the server:

1. **Generate device ID on first launch** — add to `OnboardingService` or a new `DeviceService`
2. **Add `X-Device-ID` header to all API calls** — via Angular HTTP interceptor in `core/interceptors/`
3. **After `[PORTFOLIO_READY]`** — POST portfolio to server, then also keep in localStorage as cache
4. **Dashboard** — call GET /api/v1/portfolio (server returns saved or mock), don't rely solely on localStorage

These client changes are minimal and can be done in the client session. No separate PRD needed.

---

## Data Model Changes

### StorageKeys (addition)

| Key | Value Type | Description |
|---|---|---|
| `8f_device_id` | UUID v4 string | Anonymous device identifier, generated once on first launch |

No changes to Holding, Portfolio, or Chat models — they remain the same.

---

## Tradeoffs

- **Data lost on server restart** — acceptable for assessment. Would upgrade to SQLite or Redis for production.
- **No auth** — device ID is guessable but irrelevant for a demo app with mock data.
- **Single-process only** — in-memory dict doesn't work across multiple server instances. Fine for `uvicorn main:app` single worker.
