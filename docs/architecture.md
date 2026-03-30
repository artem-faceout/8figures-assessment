# Architecture Decision Record

## Project Overview
Mobile-first AI portfolio companion app built as a technical assessment.
Demonstrates: frontend architecture, AI integration, Capacitor mobile deployment, and AI-native development pipeline.

## Problem Decomposition

The brief gives three requirements: portfolio view, AI chat, and AI insights. The real question is how to connect them into a coherent product rather than three disconnected screens.

**The core problem:** a financial app where users land with zero context, need to understand their portfolio, and can ask AI for help — all on mobile. That creates three sub-problems:

1. **Cold start** — the user opens the app for the first time. No portfolio exists yet. A blank dashboard is a dead end.
2. **Portfolio comprehension** — financial data is dense. Users need hierarchy: total value → individual holdings → per-asset deep dive.
3. **AI that feels useful, not bolted on** — the chat needs portfolio context to give meaningful answers, not generic finance advice.

### How I broke it into features

| Feature | Why this order | Depends on |
|---------|---------------|------------|
| Onboarding flow | Solves cold start. Without a portfolio, nothing else works. | Nothing |
| AI Chat with streaming | Core experience. Also serves as portfolio builder during onboarding. | Device ID for persistence |
| Portfolio Dashboard | Read-only view. Needs portfolio data to exist first. | Portfolio API, onboarding |
| Asset Detail | Drill-down from dashboard. Last because it's a refinement, not a core loop. | Dashboard, metrics + history endpoints |
| AI Insights | Async card on dashboard. Lowest priority — nice touch, not essential. | Portfolio API, Claude API |

The key insight was making onboarding and AI chat the SAME thing. During onboarding, the AI conversation builds the user's portfolio through natural dialogue ("I have 10 shares of Apple and some Bitcoin"). The chat endpoint detects `[PORTFOLIO_READY]` markers in the AI response and extracts holdings. This means the portfolio isn't a form — it's a conversation.

### Architecture Layers
- **Presentation** (Angular components + Ionic UI) → what the user sees
- **State** (Angular Signals + Services) → data flow and business logic
- **API** (HTTP client → FastAPI) → data fetching and AI proxy
- **Backend** (FastAPI) → serves data, proxies AI calls

## Key Decisions

### 1. Onboarding as AI conversation (not a form wizard)

**The problem:** the brief says "design your own data model and mock data." Most implementations would hardcode a JSON file or show a form. But a financial app that opens with a pre-filled fake portfolio feels hollow — there's no ownership.

**Alternatives considered:**
- Hardcoded mock portfolio — zero personalization, user has no connection to the data
- AI-driven portfolio building through conversation — the chat IS the data entry, and it feels natural

**Decision:** The onboarding chat asks about investment experience, then guides users to describe their holdings conversationally. The AI extracts structured data (tickers, quantities, cost basis) from natural language and returns it as a hidden JSON payload. The client parses this and persists the portfolio.

**Trade-off:** More complex to implement (streaming + parsing + persistence), but the product feels dramatically better. The user's first experience is a conversation, not a spreadsheet.

### 4. AI Chat: Server-proxied SSE streaming (not client-direct)

**Alternatives considered:**
- Client calls Claude API directly — exposes API key in client bundle, disqualifying security risk
- Server returns full response (no streaming) — poor UX, user stares at a spinner for 3-5 seconds
- WebSocket — bidirectional is unnecessary, adds connection management complexity
- Server proxies with SSE streaming — secure, progressive rendering, standard HTTP

**Decision:** SSE via FastAPI. The server holds the Claude API key, streams token-by-token to the client. The client batches DOM updates via `requestAnimationFrame` to avoid hammering Angular's change detection on every chunk.

### 5. Data Model: Computed fields on client, raw data from server

**The problem:** financial data has lots of derived values (gain/loss, percentages, daily change). Where do you compute them?

**Alternatives considered:**
- Server computes everything — client is simple, but tightly coupled. Can't recompute locally if the user's view changes.
- Client computes everything from raw prices — flexible but duplicates formulas that the AI also needs for context.
- Hybrid: server provides per-holding raw data + portfolio aggregates. Client derives display values (gain/loss coloring, formatting).

**Decision:** Hybrid. The `Holding` model from the server includes `value`, `cost_basis`, `current_price`, and `daily_change_percent`. Client-side computed fields: `gain_loss = value - (quantity × cost_basis)` and `gain_loss_percent`. This keeps the server simple (no formatting concerns) and gives the client enough data to render without extra API calls.

**Data modeling choices:**
- `cost_basis` stored per-share (not total cost) — matches how investors think and how brokerages report
- `daily_change_percent` on each holding rather than absolute change — percentage is more meaningful across different price scales
- Portfolio-level `total_value`, `daily_change`, `daily_change_percent` are server-computed aggregates — avoids floating-point drift from client-side summing

### 6. Device-based persistence (not user auth)

**The problem:** the brief doesn't mention auth, but data needs to persist somewhere. A returning user should see their portfolio.

**Alternatives considered:**
- No persistence — portfolio gone on refresh. Unacceptable.
- LocalStorage only — works for web, but Capacitor's WebView can clear storage unpredictably
- Full user auth + database — massive scope increase for zero assessment value
- Device ID + server-side storage — anonymous persistence, no auth required, survives app restarts

**Decision:** Generate a UUID device ID on first launch (stored in Capacitor Preferences). Send it as `X-Device-Id` header on every request via HTTP interceptor. Server stores portfolio per device ID. No login, no password, no auth middleware — but data persists across sessions.

### 7. UI Framework: Ionic components throughout (no raw HTML)

No raw HTML `<div>` layouts. Ionic provides platform-adaptive styling, safe area handling, touch-optimized components, and consistent mobile feel. Using `ion-card`, `ion-list`, `ion-item` everywhere means the app looks native on both iOS and Android without platform-specific CSS.

## Scope Decisions

### What I built and why

| Feature | Status | Reasoning |
|---------|--------|-----------|
| Onboarding (4-step wizard + AI) | Done | Solves cold start, demonstrates product thinking |
| AI Chat with streaming | Done | Core requirement, table-stakes per brief |
| Portfolio Dashboard | Done | Core requirement |
| Asset Detail with charts | Done | Shows depth — drill-down UX, metrics grid, price history |
| AI Insights card | Done | Contextual AI on dashboard, async-loaded |
| Guided tour | Done | Solves zero-day experience |

### What I explicitly skipped

| Skipped | Why |
|---------|-----|
| Authentication | Not in brief. Adds complexity without demonstrating relevant skills. Device persistence achieves the same UX goal. |
| Real market data | Brief says "mock data." Designed realistic mock data that demonstrates formatting and model design. |
| Android build | Brief says "at least one platform." iOS is sufficient. Saved time for pipeline. |
| Notification / push | No user need identified. Would be scope creep. |

### Trade-off philosophy
- **Depth over breadth** — fewer features, each polished. An onboarding flow that builds portfolio through AI conversation demonstrates more than five half-finished screens.
- **Pipeline over features** — the brief explicitly says to cut app scope before pipeline quality. I invested heavily in skills, agents, and workflows.
- **Product decisions over technical flex** — the onboarding flow isn't required, but it makes the app feel like a real product. Prioritized like an owner, as the brief asks.
