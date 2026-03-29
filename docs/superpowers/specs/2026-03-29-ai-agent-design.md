# AI Agent Feature — Design Spec

## Overview

AI chat agent for the 8FIGURES portfolio companion app. Three conversation modes (onboarding, common, asset) with persona-adaptive behavior based on user's self-identified investment experience. Real Anthropic Claude integration via server-side proxy with SSE streaming.

## Modes

### Onboarding Mode

**Purpose:** Guide user through portfolio setup via conversation.

**Entry:** Bridge screen (onboarding screen 3) → user taps "I have investments" or "I'm just getting started" → chat pushed into nav stack.

**Persona behavior:**
- **Beginner:** Warm, encouraging smart-friend tone. Asks simple questions ("What are you interested in investing in?"). Explains jargon. Builds portfolio gradually.
- **Experienced:** Direct, efficient analyst tone. Asks for holdings ("Tell me what you're holding"). Parses tickers/quantities quickly.

**Constraints:**
- System prompt instructs AI to always work toward building a portfolio.
- Must not go off-topic (no market commentary, no advice — just portfolio setup).
- After 3-5 exchanges with sufficient information, AI produces a structured portfolio summary.

**End signal:** AI includes `[PORTFOLIO_READY]` marker plus a hidden JSON block in its response. Client detects this to:
1. Render an inline portfolio summary card in the chat.
2. Disable the input bar (natural transition — no awkward cutoff).
3. Card has "See your dashboard →" CTA → triggers paywall.

**Initial greeting (beginner):**
> "Welcome! Tell me what you're interested in — stocks, crypto, ETFs — and I'll help you get started. Even 'I have no idea' is a perfect place to begin."

**Initial greeting (experienced):**
> "Welcome! Tell me what you're holding — stocks, ETFs, crypto — and I'll set up your dashboard. You can be as detailed as you want. Try something like: 'I have 50 shares of AAPL, some VOO, and about $10K in Bitcoin.'"

### Common Mode

**Purpose:** General portfolio Q&A and insights.

**Entry:** Dashboard FAB button or AI insight card tap → opens as Ionic modal.

**Persona behavior:**
- **Beginner:** Smart-friend tone. Explains financial concepts. Encouraging. Can discuss portfolio health, suggest learning resources, answer "what is a P/E ratio?" type questions.
- **Experienced:** Analyst tone. Data-dense, uses financial terminology. Risk analysis, sector allocation commentary, performance attribution.

**Constraints:**
- Must reference user's actual portfolio when relevant.
- No specific buy/sell recommendations (legal disclaimer territory).
- Must stay on investing/finance topics — gently redirect off-topic questions.

**Initial greeting (beginner):**
> "Hey! What would you like to know about your portfolio?"

**Initial greeting (experienced):**
> "What would you like to analyze about your portfolio?"

### Asset Mode

**Purpose:** Deep dive into a specific holding.

**Entry:** Asset detail page "Ask AI about [TICKER]" button → opens as Ionic modal with asset context.

**Persona behavior:** Same split as common mode, but focused on the specific asset. System prompt emphasizes this asset's performance, position size relative to portfolio, relevant metrics. Should not drift to other holdings unless comparing.

**Constraints:** Same as common — no buy/sell recommendations, stay on-topic.

**Initial greeting (beginner):**
> "What would you like to know about your [TICKER] position?"

**Initial greeting (experienced):**
> "What would you like to analyze about [TICKER]?"

## API Contract

### Endpoint

```
POST /api/v1/chat
Content-Type: application/json
Response: text/event-stream (SSE)
```

### Request Body

```typescript
{
  mode: "onboarding" | "common" | "asset",
  persona: "beginner" | "experienced",
  messages: [
    { role: "user" | "assistant", content: string }
  ],
  portfolio: {
    holdings: Holding[],
    totalValue: number,
    dailyChange: number,
    dailyChangePercent: number
  },
  asset?: {
    ticker: string,
    name: string
  }
}
```

Client sends full message history. Server trims to sliding window (last 10 pairs = 20 messages), prepends system prompt + portfolio data, forwards to Claude.

### SSE Events

```
event: token
data: {"content": "Your"}

event: token
data: {"content": " portfolio"}

event: done
data: {}

event: error
data: {"message": "Rate limit exceeded"}
```

Three event types: `token` (streamed text chunk), `done` (stream complete), `error` (failure).

### Design Choices

- **Stateless server:** No session management, no DB. Client sends everything needed per request.
- **Server-side window trimming:** Client sends all messages it has, server takes last 10 pairs.
- **Full portfolio in every request:** Avoids server-side state. With 5-7 holdings, token cost is trivial (~800 tokens).
- **`asset` field is a pointer:** In asset mode, tells the AI which holding to focus on. Full data is already in `portfolio.holdings`.

## Data Models

### Holding

```typescript
interface Holding {
  ticker: string;              // "AAPL"
  name: string;                // "Apple Inc."
  exchange: string;            // "NASDAQ"
  quantity: number;            // 50
  costBasis: number;           // 175.20 (avg cost per share)
  currentPrice: number;        // 198.45
  value: number;               // 9922.50 (quantity x currentPrice)
  dailyChangePercent: number;  // 2.31
}
```

Derived on client:
- `gainLoss = value - (quantity * costBasis)`
- `gainLossPercent = gainLoss / (quantity * costBasis) * 100`

### Portfolio

```typescript
interface Portfolio {
  holdings: Holding[];
  totalValue: number;           // sum of all holding values
  dailyChange: number;          // +312.50
  dailyChangePercent: number;   // +0.67
}
```

### Asset Detail Metrics (mock data, not from onboarding)

```typescript
interface AssetMetrics {
  peRatio: number;      // 32.1
  marketCap: string;    // "$3.04T"
  dayRangeLow: number;  // 195.20
  dayRangeHigh: number; // 199.10
  volume: string;       // "45.2M"
}
```

### Chat Models

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming: boolean;
  isPortfolioReady: boolean;
}

interface ChatConfig {
  mode: 'onboarding' | 'common' | 'asset';
  persona: 'beginner' | 'experienced';
  asset?: { ticker: string; name: string };
}
```

### Portfolio Persistence

When AI emits `[PORTFOLIO_READY]`, the response contains the marker on its own line followed by a JSON block wrapped in `<portfolio_data>` tags:

```
Here's your portfolio summary!

[PORTFOLIO_READY]
<portfolio_data>
{"holdings": [{"ticker": "AAPL", "name": "Apple Inc.", ...}], "totalValue": 47230, ...}
</portfolio_data>
```

Client parses this: strips the marker and `<portfolio_data>` block from the displayed message, extracts the JSON, stores in `PortfolioService` signal, persists to `localStorage`. Dashboard reads from this service.

## Server Architecture

### Components

```
server/
  routers/chat.py        — POST /api/v1/chat endpoint
  services/ai_service.py — builds system prompt, calls Anthropic, streams response
  models/chat.py         — Pydantic request/response models
```

### System Prompt Construction

`ai_service.py` builds the system prompt:

1. **Base personality** — selected by `persona` field (beginner=friendly, experienced=analyst)
2. **Mode instructions** — selected by `mode` field (onboarding constraints, common constraints, or asset focus)
3. **Portfolio data** — serialized from request body, always appended
4. **Asset focus** — if mode=asset, additional instructions to focus on the specific ticker

### Sliding Window

Server receives all messages, takes the last 20 (10 user + 10 assistant), prepends system prompt. Total context per request: ~2-3K tokens system + up to ~20K tokens conversation history.

### Streaming

FastAPI `StreamingResponse` with `media_type="text/event-stream"`. Async generator reads from Anthropic's streaming API, yields SSE-formatted events.

### Configuration

- `ANTHROPIC_API_KEY` in `.env` (already in `.env.example`)
- Model: `claude-sonnet-4-20250514` (fast, cheap, good enough for chat)
- Max tokens per response: 1024
- Temperature: 0.7 (conversational, not too creative)

## Client Architecture

### Components

```
client/src/app/
  features/chat/
    chat.page.ts          — single component for all three modes
    chat.page.html        — template: header, message list, input bar, chips
    chat.page.scss         — styles matching Figma design
  core/
    services/chat.service.ts    — SSE streaming, message state management
    services/portfolio.service.ts — portfolio state, localStorage persistence
    models/chat.model.ts        — ChatMessage, ChatConfig, ThinkingPhrase types
```

### ChatPage Component

Single component handles all three modes. Receives config via:
- **Onboarding:** route state (`router.navigate(['/chat'], { state: { mode, persona } })`)
- **Common/Asset:** modal componentProps (`modalController.create({ component: ChatPage, componentProps: { config } })`)

**Header:** Back arrow (onboarding, pushed) or close X (common/asset, modal).

### ChatService

- Manages message state via Signals: `messages`, `isStreaming`, `thinkingPhrase`
- `sendMessage()` — POSTs to `/api/v1/chat`, opens fetch ReadableStream, parses SSE events, appends tokens to current AI message
- Uses `fetch()` with `ReadableStream` (not `EventSource` — need POST with body)
- Batches signal updates via `requestAnimationFrame` (per CLAUDE.md convention)
- Detects `[PORTFOLIO_READY]` marker, extracts JSON, signals portfolio service

### Thinking Phrases

Random phrase shown in AI bubble before first token arrives. Per-mode pools:

**Onboarding:**
- "Getting to know your portfolio..."
- "Setting things up..."
- "Mapping out your investments..."
- "Putting the pieces together..."
- "Building your profile..."

**Common:**
- "Analyzing your portfolio..."
- "Crunching the numbers..."
- "Reviewing your holdings..."
- "Digging into the data..."
- "Checking the details..."

**Asset:**
- "Looking into {TICKER}..."
- "Pulling up {TICKER} details..."
- "Researching {TICKER}..."
- "Analyzing {TICKER} performance..."

### Suggestion Chips

Static per mode, always visible above the input bar:

**Onboarding (beginner):** "I own some stocks", "I have crypto", "Help me get started", "What should I invest in?"

**Onboarding (experienced):** "Here are my holdings", "Import from spreadsheet", "I hold ETFs and stocks"

**Common:** "Portfolio health check", "Risk analysis", "Top performers", "Diversification report"

**Asset:** "Recent performance", "Compare to sector", "What's the outlook?", "Position sizing"

### Navigation & Entry Points

**Onboarding (nav stack push):**
- Bridge screen → `router.navigate(['/chat'], { state: { mode: 'onboarding', persona } })`
- Header: back arrow
- On `[PORTFOLIO_READY]`: show inline card, disable input, CTA → paywall

**Common mode (modal):**
- Dashboard FAB or AI insight card → `modalController.create({ component: ChatPage, componentProps: { config: { mode: 'common', persona } } })`
- Header: close (X) button

**Asset mode (modal):**
- Asset detail "Ask AI about [TICKER]" → `modalController.create({ component: ChatPage, componentProps: { config: { mode: 'asset', persona, asset: { ticker, name } } } })`
- Header: close (X) button

### State

- Each modal/page gets fresh chat state (no shared conversations between modes)
- Messages persist in memory for modal lifetime, lost on close
- Portfolio data persists in `localStorage` via `PortfolioService`
- No cross-session conversation persistence for MVP

## UI Design (from Figma)

Dark mode with gold (#F7931A) accent. Key elements:

- **Background:** Near-black (#030304) with subtle radial gold gradient
- **User bubbles:** Gold (#F7931A) background, dark brown (#603500) text, rounded pill with flat bottom-right corner
- **AI bubbles:** Dark charcoal (#1C1B1D) background, warm white (#E5E1E4) text, rounded pill with flat bottom-left corner
- **AI avatar:** 40x40 circle, dark bg (#353437), gold border, crystalline gold texture
- **Ticker references:** JetBrains Mono Bold, gold (#FFB874), underlined inline
- **Input bar:** Dark shell (#131315), rounded top corners, pill-shaped input field (#0E0E10), gold send button
- **Suggestion chips:** Semi-transparent dark pills, JetBrains Mono 11px uppercase, warm beige text (#DBC2AE)
- **Bento data cards:** Semi-transparent dark cards below AI messages for structured data (risk scores, volatility, etc.)
- **Header:** Frosted glass (backdrop-blur 12px), "AI Assistant" title in gold, "SYSTEM ONLINE" status dot
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels/tickers/timestamps)

## Out of Scope (MVP)

- No conversation history persistence across app restarts
- No real market data integration (all mock)
- No typing indicators between stream pauses
- No dynamic/AI-generated suggestion chips
- No multi-conversation management
- No image/chart rendering in AI responses (text + bento cards only)
- No voice input
- No push notifications for insights
