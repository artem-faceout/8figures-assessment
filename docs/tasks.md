# Task Breakdown

## Phase 1: Scaffolding
- [ ] Task 1.1: Create Angular 20 project with Ionic + Capacitor
- [ ] Task 1.2: Create FastAPI server with project structure
- [ ] Task 1.3: Configure dev environment (proxy, CORS, environments)

## Phase 2: Data Layer
- [ ] Task 2.1: Define TypeScript data models (Portfolio, Holding, etc.)
- [ ] Task 2.2: Define Pydantic models on server
- [ ] Task 2.3: Create mock portfolio data (realistic tickers, prices, quantities)
- [ ] Task 2.4: Implement GET /api/v1/portfolio endpoint
- [ ] Task 2.5: Implement PortfolioService in Angular

## Phase 3: Portfolio Dashboard
- [ ] Task 3.1: Dashboard page component (layout, header with total value)
- [ ] Task 3.2: HoldingCard shared component (ticker, value, gain/loss)
- [ ] Task 3.3: Financial formatting pipes (currency, percent, gain/loss color)
- [ ] Task 3.4: Wire dashboard to service, display real mock data

## Phase 4: AI Chat
- [ ] Task 4.1: Chat service interface + types
- [ ] Task 4.2: Server-side streaming endpoint (POST /api/v1/chat)
- [ ] Task 4.3: Chat page component (message list, input bar)
- [ ] Task 4.4: Streaming display (progressive text rendering)
- [ ] Task 4.5: Portfolio context injection into AI system prompt

## Phase 5: Mobile
- [ ] Task 5.1: Capacitor iOS build + simulator run
- [ ] Task 5.2: Fix any WebView-specific issues
- [ ] Task 5.3: Test all features on simulator

## Phase 6: Polish
- [ ] Task 6.1: Full code review pass (run code-review-checklist)
- [ ] Task 6.2: Build verification (lint, types, build, cap sync)
- [ ] Task 6.3: README with setup/run instructions
- [ ] Task 6.4: Record Loom video
