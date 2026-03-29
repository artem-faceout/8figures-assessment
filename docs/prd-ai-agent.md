# PRD: AI Agent Chat Feature

## Summary

Real-time AI chat agent with three modes (onboarding, common, asset), persona-adaptive behavior, and SSE streaming. Full vertical slice: FastAPI backend proxying Anthropic Claude API, Angular frontend with dark-mode gold-accent UI from Figma.

**Design spec:** `docs/superpowers/specs/2026-03-29-ai-agent-design.md`
**Data models:** `docs/data-models.md` (Portfolio, Chat sections)
**API contract:** `docs/api-contract.md` (AI Chat, Portfolio, Metrics endpoints)

---

## Implementation Manifest

### Files to Create

#### Server

| File | Purpose |
|---|---|
| `server/models/portfolio.py` | Pydantic models: Holding, Portfolio, AssetMetrics, AssetContext |
| `server/models/chat.py` | Pydantic models: ChatMessage, ChatRequest, SSE event types |
| `server/models/common.py` | Pydantic models: ApiResponse[T], ApiError, Meta (shared envelope) |
| `server/routers/chat.py` | POST /api/v1/chat — validates request, calls ai_service, returns StreamingResponse |
| `server/routers/portfolio.py` | GET /api/v1/portfolio, GET /api/v1/portfolio/{ticker}/metrics |
| `server/services/ai_service.py` | Builds system prompt per mode/persona, manages sliding window, calls Anthropic streaming API |
| `server/services/prompt_templates.py` | System prompt templates for each mode × persona combination |
| `server/data/mock_portfolio.py` | Hardcoded mock portfolio data matching Figma design values (AAPL, MSFT, VOO, NVDA, BTC) |
| `server/data/mock_metrics.py` | Hardcoded mock asset metrics (P/E, market cap, volume, day range per ticker) |
| `server/tests/test_chat.py` | Tests for chat endpoint: validation, SSE format, mode routing, error handling |
| `server/tests/test_portfolio.py` | Tests for portfolio endpoints: response shape, envelope wrapping, 404 on unknown ticker |
| `server/tests/test_ai_service.py` | Tests for prompt construction, sliding window logic, persona selection |

#### Client

| File | Purpose |
|---|---|
| `client/src/app/features/chat/chat.page.ts` | Main chat component — handles all 3 modes, manages UI state |
| `client/src/app/features/chat/chat.page.html` | Template: header (back/close), message list, thinking indicator, input bar, suggestion chips |
| `client/src/app/features/chat/chat.page.scss` | Styles matching Figma: dark mode, gold accent, bubble shapes, frosted header |
| `client/src/app/features/chat/chat.page.spec.ts` | Component tests: mode switching, chip rendering, input disable on portfolio ready |
| `client/src/app/core/services/chat.service.ts` | SSE streaming via fetch + ReadableStream, message state (Signals), RAF batching, portfolio-ready detection |
| `client/src/app/core/services/chat.service.spec.ts` | Service tests: SSE parsing, sliding window sends, portfolio extraction |
| `client/src/app/core/services/portfolio.service.ts` | Portfolio state management, localStorage persistence, holdings CRUD |
| `client/src/app/core/services/portfolio.service.spec.ts` | Service tests: persist/load, signal updates |
| `client/src/app/core/models/chat.model.ts` | Types: ChatMessage, ChatConfig, ChatMode, ThinkingPhrase, SuggestionChip |
| `client/src/app/features/chat/constants/thinking-phrases.ts` | Per-mode thinking phrase pools (onboarding, common, asset) |
| `client/src/app/features/chat/constants/suggestion-chips.ts` | Per-mode × persona static chip sets |
| `client/src/app/features/chat/constants/initial-greetings.ts` | Per-mode × persona AI greeting messages (client-side, not from server) |
| `client/src/app/features/chat/components/portfolio-summary-card.component.ts` | Inline portfolio summary card shown when `[PORTFOLIO_READY]` detected — displays total value, top holdings, "See your dashboard →" CTA |
| `client/src/app/features/chat/components/portfolio-summary-card.component.html` | Template for the inline summary card |
| `client/src/app/features/chat/components/portfolio-summary-card.component.scss` | Styles: gold accent, matches Figma chat card design |

### Files to Modify

| File | Change | Prerequisites |
|---|---|---|
| `server/main.py` | Register chat and portfolio routers (`app.include_router(...)`) | Routers created |
| `client/src/app/app.routes.ts` | Add `/chat` route with lazy loading | ChatPage created |
| `client/src/app/core/models/onboarding.model.ts` | Add `8f_portfolio` to STORAGE_KEYS | — |
| `client/src/app/features/onboarding/components/bridge/onboarding-bridge.component.ts` | On continue, navigate to `/chat` with mode + persona in route state | Chat route exists |
| `client/src/app/core/models/api.generated.ts` | ✅ Regenerated from OpenAPI after server models are built | Server running |

### Prerequisites Status

- [x] Anthropic SDK in `requirements.txt` (anthropic>=0.40.0)
- [x] `.env.example` has `ANTHROPIC_API_KEY` placeholder
- [x] CORS configured for localhost:4200 and capacitor://localhost
- [x] Server directory structure exists (models/, routers/, services/, data/)
- [x] `InvestmentProfile` type exists in onboarding model ('beginner' | 'experienced')
- [x] `OnboardingService.investmentProfile` signal available for reading persona
- [x] `environment.ts` has `apiUrl: 'http://localhost:8000'`
- [ ] `.env` file with actual `ANTHROPIC_API_KEY` value (user must provide)
- [ ] Fonts loaded in client: Space Grotesk, Inter, JetBrains Mono (check index.html)

---

## Execution Strategy

This is a **single feature** with server and client components. Since it's one feature, no overlap matrix is needed. Recommended execution order:

### Phase 1: Server (can run independently)
1. Common models (`models/common.py` — ApiResponse envelope)
2. Portfolio models + mock data + portfolio router
3. Chat models + ai_service + prompt templates + chat router
4. Tests for all server components
5. Verify: `pytest -v` passes, server starts, OpenAPI spec correct

### Phase 2: Client (depends on server OpenAPI for type generation)
1. Regenerate types: `npm run generate:types`
2. Chat models (`chat.model.ts`)
3. Portfolio service + chat service
4. Chat page component (UI from Figma)
5. Route registration + bridge component modification
6. Tests for services and component
7. Verify: `ng lint` clean, `npx jest` passes, visual check in browser

### Phase 3: Integration
1. Run server + client together
2. Test onboarding → chat → portfolio-ready → paywall flow
3. Test common mode from dashboard
4. Test asset mode from asset detail
5. Visual check against Figma design

---

## Key Implementation Notes

**SSE streaming on client:** Use `fetch()` with `ReadableStream`, NOT `EventSource` (which only supports GET). Parse SSE format manually: split on `\n\n`, extract `event:` and `data:` lines.

**Signal batching:** Per CLAUDE.md, do NOT update signals per-chunk. Accumulate tokens and flush via `requestAnimationFrame`.

**Portfolio-ready detection:** Parse streamed text for `[PORTFOLIO_READY]` marker. When found, extract `<portfolio_data>` JSON block, strip both from displayed message, persist portfolio, disable input, show summary card.

**System prompt structure:** Concatenate: base personality (persona) → mode instructions → portfolio data → asset focus (if applicable). Keep total system prompt under 2K tokens.

**Sliding window:** Server takes last 20 messages (10 user + 10 assistant). If messages array has fewer, use all. Never trim system prompt — only conversation history.

**Modal vs push:** Onboarding chat is pushed into nav stack (has back button). Common/asset chat opens as Ionic modal (has close X). ChatPage must detect which mode it's in and render header accordingly.

**Initial greetings are client-side:** The first AI message per mode/persona is NOT fetched from the server. It's injected by the client from `initial-greetings.ts` constants. This avoids an API call just for a canned greeting and ensures instant display.

**"SYSTEM ONLINE" header indicator:** Decorative only. Always shows green dot + "SYSTEM ONLINE" text. No actual health check — purely cosmetic to match Figma design.

**Bento data cards (from Figma):** The Figma chat design shows inline bento-style data cards below AI messages (e.g., "CURRENT RISK: 7.8/10", "VOLATILITY: +12.4%"). For MVP, these are **out of scope** — the AI will communicate this data as plain text. Bento cards would require structured data extraction from AI responses, which adds significant parsing complexity. Can be added in a future iteration.

**Portfolio summary card (onboarding only):** When `[PORTFOLIO_READY]` is detected, an inline card component renders inside the chat message list. It shows: total portfolio value, list of holdings with values, and a "See your dashboard →" CTA button. Tapping the CTA triggers navigation to the paywall screen. The input bar is disabled once this card appears.

**Figma design reference:** Chat UI node `2:507` in file `4r0x6munSmJnd4HnJH5Wol`. Key visual specs:
- User bubble: border-radius 48px (flat bottom-right), gold bg (#F7931A), dark text (#603500)
- AI bubble: border-radius 48px (flat bottom-left), dark bg (#1C1B1D), warm white text (#E5E1E4)
- AI avatar: 40x40 circle, bg #353437, gold border rgba(247,147,26,0.2), crystalline texture
- Header: backdrop-blur 12px, bg rgba(3,3,4,0.6), gold title "AI Assistant", green status dot #E9C400
- Input shell: bg #131315, rounded top 32px, input bg #0E0E10, pill shape, gold send button
- Chips: bg rgba(32,31,33,0.5), border rgba(85,67,53,0.2), JetBrains Mono 11px uppercase
- Timestamps: JetBrains Mono 10px, color #A38D7B
- Message gap: 40px between message groups
