# Architecture Decision Record

## Project Overview
Mobile-first AI portfolio companion app built as a technical assessment.
Demonstrates: frontend architecture, AI integration, Capacitor mobile deployment, and AI-native development pipeline.

## Problem Decomposition

The app has three core surfaces:
1. **Portfolio Dashboard** — read-only view of holdings with financial metrics
2. **AI Chat** — conversational interface about portfolio, with streaming responses
3. **AI Insights** — contextual observations about the portfolio (stretch goal)

### Architecture Layers
- **Presentation** (Angular components + Ionic UI) → what the user sees
- **State** (Angular Signals + Services) → data flow and business logic
- **API** (HTTP client → FastAPI) → data fetching and AI proxy
- **Backend** (FastAPI) → serves data, proxies AI calls

## Key Decisions

### 1. State Management: Signals (not NgRx)

**Alternatives considered:**
- NgRx (full Redux pattern) — overkill for this scope, adds boilerplate
- RxJS BehaviorSubjects — works but Signals are the modern Angular direction
- Signals — lightweight, built-in, sufficient for app with 2-3 screens

**Decision:** Signals. This app has limited state complexity. Signals keep it simple and align with Angular 21 best practices.

### 2. AI Chat: Server-proxied streaming (not client-direct)

**Alternatives considered:**
- Client calls Claude API directly — exposes API key in client bundle, security risk
- Server returns full response (no streaming) — poor UX, user waits for full generation
- Server proxies with SSE streaming — secure, real-time feel

**Decision:** Server-proxied SSE streaming. API key stays on server. Client gets progressive response.

### 3. Backend: FastAPI (not Express/Node)

**Alternatives considered:**
- Express.js — familiar to frontend devs, but 8FIGURES uses Python/FastAPI
- FastAPI — async, auto-docs, Pydantic validation, matches target company stack

**Decision:** FastAPI. Aligns with 8FIGURES stack (Python + FastAPI + Pydantic). Shows awareness of the full technical ecosystem.

### 4. Data Model: Designed mock data (not copied JSON)

Assessment explicitly states: "This is an architectural decision — we're evaluating your data modeling choices."

Portfolio model captures:
- Holdings with realistic tickers, quantities, cost basis, current price
- Computed fields: market value, gain/loss ($), gain/loss (%), daily change
- Portfolio-level aggregates: total value, total gain/loss, daily change

### 5. UI Framework: Ionic components throughout

No raw HTML `<div>` layouts. Ionic provides:
- Platform-adaptive styling (iOS/Android look native)
- Safe area handling
- Touch-optimized components
- Dark mode support out of the box

## Scope Decisions

### Building (core)
- Portfolio dashboard with holdings list
- AI chat with streaming
- Capacitor iOS deployment
- Mock data API

### Building (if time permits)
- AI insights panel
- Pull-to-refresh
- Dark mode toggle
- Holdings detail view

### Explicitly NOT building
- Authentication (not in brief, adds complexity without signal)
- Real market data integration (mock data is intentional per brief)
- Android build (brief says "at least one platform")
- Full test suite (brief doesn't emphasize testing, pipeline is higher priority)

## Trade-offs documented
- Chose scope depth over breadth — fewer features, higher quality
- Pipeline quality over app feature count (brief explicitly recommends this)
- iOS only for mobile — sufficient for demo, saves time for pipeline polish
