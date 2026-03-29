# Dashboard & Asset Detail Screens — Design Spec

## Overview

Two new screens completing the core portfolio experience: a Dashboard showing portfolio summary, holdings list, and AI insight, and an Asset Detail page showing per-asset price chart, financial metrics, and user position.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Historical price data | Generated mock via algorithm (option B) | Interactive time range switching works, data looks plausible, stays within mock philosophy |
| Market status header | Cut from scope | Not high value for assessment demo |
| AI insight card | Real Claude call, async load with skeleton | Shows real AI integration on dashboard |
| Close timestamp | Cut from scope | Not in existing models, low value |
| Dashboard bar chart | Relative holding values (not time series) | All data already in Portfolio.holdings, no extra API call |
| Navigation pattern | Full page push (Approach A) | Matches Figma back-arrow design, follows existing feature structure |
| Chart library | Hand-drawn SVG polyline with bezier smoothing | No heavy dependency, matches simple Figma curve |

## New API Endpoints

### GET /api/v1/portfolio/{ticker}/history

Query params: `range` — one of `1W`, `1M`, `3M`, `1Y`, `ALL`

Response: `ApiResponse[PriceHistory]`

```python
class PricePoint(BaseModel):
    timestamp: datetime
    price: float = Field(ge=0)

class PriceHistory(BaseModel):
    ticker: str
    range: str  # "1W", "1M", "3M", "1Y", "ALL"
    points: list[PricePoint]
```

Generation algorithm:
- Starts from `current_price` in mock data, walks backward in time
- Random volatility scaled per asset (BTC ~3% daily, VOO ~0.5%, stocks ~1-1.5%)
- Points per range: 1W=7, 1M=30, 3M=90, 1Y=252, ALL=500
- Seeded by ticker name so same ticker returns visually consistent data within a server restart

### GET /api/v1/portfolio/insight

Response: `ApiResponse[PortfolioInsight]`

```python
class PortfolioInsight(BaseModel):
    ticker: str
    asset_name: str
    headline: str   # e.g. "NVDA MOMENTUM ALERT"
    body: str       # 1-2 sentence insight
```

Server logic:
- Picks a random holding from the portfolio
- Sends a short prompt to Claude: "Give a brief, factual market insight (1-2 sentences) about {asset_name} ({ticker}) currently at ${current_price}, {daily_change_percent}% today. Format as a headline (5 words max, ALL CAPS) and body."
- Single request/response, no streaming
- Returns structured response

## Dashboard Screen

### Route
`/dashboard` — tab 1 in the root `ion-tabs` layout. Replaces current `home` route.

### Layout (top to bottom)

#### 1. Portfolio Summary Card
- Dark card with subtle gradient background
- "TOTAL NET WORTH" label (small, uppercase, muted)
- `Portfolio.total_value` — large display, formatted as currency
- `Portfolio.daily_change_percent` — orange badge (positive) or red badge (negative)
- `Portfolio.daily_change` — subtitle, formatted as "+$312.50 today"
- Bar chart below: one bar per holding, height proportional to `holding.value / portfolio.total_value`, gold/orange fill

#### 2. AI Insight Card
- Loads async — shows `ion-skeleton-text` (headline + 3 body lines) until ready
- Gold sparkle icon (left)
- `PortfolioInsight.headline` — bold, uppercase
- `PortfolioInsight.body` — regular text, muted color
- Chevron `>` right side (non-functional, visual only)
- Cached in signal for session — doesn't re-fetch on tab revisit

#### 3. Holdings Section
- "HOLDINGS" header (left) + "VIEW ALL" text (right, non-functional)
- List of holding rows, each as `ion-item`:
  - Left: circle avatar (first letter of ticker, color derived from ticker hash)
  - Left text: ticker (bold) + company name (muted, smaller)
  - Right text: value (bold, formatted currency) + daily_change_percent (orange/red)
- Tap navigates to `/asset/:ticker`

#### 4. FAB Button
- Fixed position, bottom center, above tab bar
- Gold circle with sparkle icon
- Tap navigates to `/chat`

#### 5. Tab Bar
- `ion-tabs` with two tabs: Dashboard (portfolio icon, active) + Chat (chat bubble icon)

### Components
- `DashboardPage` — feature component in `features/dashboard/`
- `PortfolioSummaryComponent` — in `shared/components/portfolio-summary/`
- `InsightCardComponent` — in `shared/components/insight-card/`
- `HoldingRowComponent` — in `shared/components/holding-row/`

## Asset Detail Screen

### Route
`/asset/:ticker` — pushed onto dashboard tab's navigation stack. Back arrow pops back to dashboard.

### Data loading
Three parallel operations on init:
1. `getHoldingByTicker(ticker)` — from cached portfolio signal (instant)
2. `GET /api/v1/portfolio/{ticker}/metrics` — existing endpoint
3. `GET /api/v1/portfolio/{ticker}/history?range=1M` — new endpoint (default range)

### Layout (top to bottom)

#### 1. Header
- `ion-header` with `ion-toolbar`
- Back button (left) — `ion-back-button`
- Circle avatar + asset name + "TICKER · EXCHANGE" subtitle

#### 2. Price Hero
- `Holding.current_price` — large currency display
- Trend icon (small SVG wave) + `Holding.daily_change_percent` badge (orange/red)

#### 3. Price Chart
- SVG-based line chart, orange stroke on dark background
- Renders `PriceHistory.points` as a polyline with bezier smoothing
- Time range pills below: 1W, 1M (default active), 3M, 1Y, ALL
- Switching range: re-fetches history, chart area shows fade transition
- Loading state: skeleton shimmer rectangle same height as chart

#### 4. Metrics Grid
- 2x2 grid of small `ion-card` tiles:
  - P/E RATIO: `AssetMetrics.pe_ratio` (display "N/A" when null)
  - MARKET CAP: `AssetMetrics.market_cap`
  - DAY RANGE: `$day_range_low — $day_range_high`
  - VOLUME: `AssetMetrics.volume`
- Loading state: `ion-skeleton-text` in each tile

#### 5. Your Position Card
- Dark card with gold left border accent
- 2x2 grid:
  - SHARES: `Holding.quantity`
  - AVG COST: `Holding.cost_basis` (formatted currency)
  - TOTAL VALUE: `Holding.value` (formatted currency)
  - TOTAL GAIN: computed `(current_price - cost_basis) * quantity`, with percent `(current_price - cost_basis) / cost_basis * 100`
- Gain value colored orange (positive) or red (negative)

#### 6. Ask AI Button
- Full-width button, gold background, sparkle icon + "Ask AI" text
- Navigates to `/chat` with pre-configured asset mode:
  ```
  ChatConfig { mode: 'asset', persona: <stored_profile>, asset: { ticker, name } }
  ```

### Components
- `AssetDetailPage` — feature component in `features/asset-detail/`
- `PriceChartComponent` — in `shared/components/price-chart/` (reusable)
- `MetricsGridComponent` — in `shared/components/metrics-grid/`
- `PositionCardComponent` — in `shared/components/position-card/`

## Service Layer Changes

### PortfolioService (extended)

New methods:
- `getHistory(ticker: string, range: string): Observable<PriceHistory>` — no caching, fresh fetch per range change
- `getInsight(): Observable<PortfolioInsight>` — result cached in a signal, one call per session
- `getHoldingByTicker(ticker: string): Signal<Holding | undefined>` — computed from existing cached portfolio signal

### Routing changes

Replace current route config:
```
ion-tabs (root, guarded by onboardingGuard)
├── /dashboard          → DashboardPage (tab 1)
│   └── /asset/:ticker  → AssetDetailPage (pushed on tab 1 nav stack)
└── /chat               → ChatPage (tab 2)
```

The current `/home` route is replaced by `/dashboard`. Default redirect after onboarding changes from `home` to `dashboard`.

## Type Generation

After adding `PricePoint`, `PriceHistory`, `PortfolioInsight` models and the 2 new endpoints on the server:
1. Run server: `uvicorn main:app --port 8000`
2. Regenerate types: `cd client && npm run generate:types`
3. New types auto-available as `components["schemas"]["PricePoint"]` etc.

## Out of Scope

- Market status header ("MARKET OPEN", location/time)
- Close timestamp on asset detail
- "VIEW ALL" link functionality (all holdings already visible)
- Chart touch interactions (scrubbing, crosshair, tooltips)
- Insight card chevron drill-down
- Pull-to-refresh on dashboard (could add later)
- Landscape orientation support
