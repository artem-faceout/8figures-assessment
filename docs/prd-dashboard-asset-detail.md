# Feature: Dashboard & Asset Detail Screens

## Scope

- **Endpoints:** GET /api/v1/portfolio/{ticker}/history, GET /api/v1/portfolio/insight (details in api-contract.md)
- **Models:** PricePoint, PriceHistory, PortfolioInsight (details in data-models.md)
- **Existing endpoints used:** GET /api/v1/portfolio, GET /api/v1/portfolio/{ticker}/metrics
- **Design spec:** docs/superpowers/specs/2026-03-30-dashboard-asset-detail-design.md

## TDD Slice Order

### Server slices
1. **Model: PricePoint + PriceHistory** — Pydantic validation, field constraints
2. **Model: PortfolioInsight** — Pydantic validation
3. **Service: price history generator** — algorithmic mock data from current_price + volatility
4. **Endpoint: GET /api/v1/portfolio/{ticker}/history** — returns generated history, 404 for unknown ticker, range validation
5. **Service: insight generator** — calls Claude, parses structured JSON response
6. **Endpoint: GET /api/v1/portfolio/insight** — returns AI insight, handles API errors

### Client slices
7. **Model: regenerate types** — `npm run generate:types` after server models exist
8. **Service: PortfolioService extensions** — `getHistory()`, `getInsight()`, `getHoldingByTicker()`
9. **Component: HoldingRowComponent** — shared, renders single holding with avatar/ticker/value/change
10. **Component: PortfolioSummaryComponent** — shared, renders total value + change + bar chart
11. **Component: InsightCardComponent** — shared, renders headline/body with skeleton loading
12. **Component: DashboardPage** — feature page, composes summary + insight + holdings list
13. **Component: PriceChartComponent** — shared, SVG polyline with bezier smoothing from PriceHistory points
14. **Component: MetricsGridComponent** — shared, 2x2 grid of metric tiles
15. **Component: PositionCardComponent** — shared, 2x2 grid with computed gain
16. **Component: AssetDetailPage** — feature page, composes chart + metrics + position + Ask AI button
17. **Routing: tab layout + routes** — ion-tabs (dashboard + chat), /asset/:ticker pushed on dashboard stack

## Files to Create

### Server
- `server/models/history.py` — PricePoint, PriceHistory models
- `server/models/insight.py` — PortfolioInsight model
- `server/services/history_service.py` — algorithmic price history generator
- `server/services/insight_service.py` — Claude insight generator
- `server/tests/test_history.py` — history endpoint + generator tests
- `server/tests/test_insight.py` — insight endpoint tests

### Client
- `client/src/app/shared/components/holding-row/holding-row.component.ts` (+html, +scss, +spec)
- `client/src/app/shared/components/portfolio-summary/portfolio-summary.component.ts` (+html, +scss, +spec)
- `client/src/app/shared/components/insight-card/insight-card.component.ts` (+html, +scss, +spec)
- `client/src/app/shared/components/price-chart/price-chart.component.ts` (+html, +scss, +spec)
- `client/src/app/shared/components/metrics-grid/metrics-grid.component.ts` (+html, +scss, +spec)
- `client/src/app/shared/components/position-card/position-card.component.ts` (+html, +scss, +spec)
- `client/src/app/features/dashboard/dashboard.page.ts` (+html, +scss, +spec)
- `client/src/app/features/asset-detail/asset-detail.page.ts` (+html, +scss, +spec)
- `client/src/app/layouts/tabs/tabs.layout.ts` (+html, +scss) — ion-tabs shell

## Files to Modify

### Server
- `server/routers/portfolio.py` — add history and insight endpoints
- `server/main.py` — no change needed (portfolio_router already registered)

### Client
- `client/src/app/core/services/portfolio.service.ts` — add `getHistory()`, `getInsight()`, `getHoldingByTicker()`
- `client/src/app/core/models/api.generated.ts` — regenerated (not hand-edited)
- `client/src/app/app.routes.ts` — replace home route with tabs layout, add dashboard + asset detail routes

## Edge Cases

- **Empty portfolio (no holdings):** Dashboard shows "No holdings yet" empty state with CTA to chat
- **Unknown ticker in route param:** Asset detail redirects back to dashboard
- **Insight API failure:** Insight card shows "Insight unavailable" state, dashboard still functional
- **History API failure:** Chart area shows "Unable to load chart" placeholder
- **Null pe_ratio (VOO, BTC):** Metrics grid shows "N/A" instead of number
- **Negative daily change:** Red color for loss values, orange for gains
- **Range switch while loading:** Cancel previous request before starting new one

## Prerequisites

- [x] Design spec finalized (docs/superpowers/specs/2026-03-30-dashboard-asset-detail-design.md)
- [x] API contract defined (docs/api-contract.md)
- [x] Data models defined (docs/data-models.md)
- [x] Existing portfolio + metrics endpoints working
- [x] Existing chat feature working (for Ask AI navigation)
