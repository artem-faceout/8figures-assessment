# AI Agent Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Angular client for the AI chat agent — SSE streaming, three chat modes (onboarding/common/asset), Figma-matched dark+gold UI, portfolio persistence, and bridge→chat navigation.

**Architecture:** Single `ChatPage` component handles all three modes, receiving config via route state (onboarding) or modal componentProps (common/asset). `ChatService` manages SSE streaming via fetch + ReadableStream with RAF-batched signal updates. `DeviceService` generates a UUID for X-Device-ID header, injected via HTTP interceptor. `PortfolioService` persists portfolio data to both server and localStorage.

**Tech Stack:** Angular 21 (standalone components, Signals), Ionic Framework, TypeScript strict mode, fetch API for SSE streaming, Capacitor Preferences for device ID storage.

**Specs:**
- PRD: `docs/prd-ai-agent.md`
- Design spec: `docs/superpowers/specs/2026-03-29-ai-agent-design.md`
- Device portfolio update: `docs/prd-ai-agent-update-001-device-portfolio.md`
- API contract: `docs/api-contract.md`
- Generated types: `client/src/app/core/models/api.generated.ts`

---

## File Structure

### Files to Create

| File | Purpose |
|---|---|
| `client/src/app/core/models/chat.model.ts` | Client-side chat types: ChatMessage, ChatConfig, ChatMode, SuggestionChip |
| `client/src/app/core/services/device.service.ts` | UUID generation + Capacitor Preferences persistence for X-Device-ID |
| `client/src/app/core/services/device.service.spec.ts` | Tests for device ID generation and persistence |
| `client/src/app/core/interceptors/device-id.interceptor.ts` | HttpInterceptorFn that attaches X-Device-ID header to all API requests |
| `client/src/app/core/interceptors/device-id.interceptor.spec.ts` | Tests for interceptor |
| `client/src/app/core/services/portfolio.service.ts` | Portfolio state via Signals, localStorage cache, server sync |
| `client/src/app/core/services/portfolio.service.spec.ts` | Tests for portfolio service |
| `client/src/app/core/services/chat.service.ts` | SSE streaming via fetch, message state, RAF batching, portfolio-ready detection |
| `client/src/app/core/services/chat.service.spec.ts` | Tests for SSE parsing, message management, portfolio extraction |
| `client/src/app/features/chat/constants/thinking-phrases.ts` | Per-mode thinking phrase pools |
| `client/src/app/features/chat/constants/suggestion-chips.ts` | Per-mode x persona static chip sets |
| `client/src/app/features/chat/constants/initial-greetings.ts` | Per-mode x persona AI greeting messages |
| `client/src/app/features/chat/chat.page.ts` | Main chat component — all 3 modes, header, messages, input, chips |
| `client/src/app/features/chat/chat.page.html` | Template: header, message list, thinking indicator, input bar, chips |
| `client/src/app/features/chat/chat.page.scss` | Styles matching Figma: dark mode, gold accent, bubble shapes, frosted header |
| `client/src/app/features/chat/chat.page.spec.ts` | Component tests: rendering, mode switching, chip clicks, input |
| `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.ts` | Inline portfolio card shown on [PORTFOLIO_READY] |
| `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.html` | Template for summary card |
| `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.scss` | Styles for summary card |
| `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.spec.ts` | Tests for summary card |

### Files to Modify

| File | Change |
|---|---|
| `client/src/app/core/models/onboarding.model.ts` | Add `deviceId` to STORAGE_KEYS |
| `client/src/app/app.routes.ts` | Add `/chat` route with lazy loading |
| `client/src/app/app.config.ts` | Register device-id interceptor with provideHttpClient |
| `client/src/app/features/onboarding/onboarding.page.ts` | Bridge continue → navigate to `/chat` with mode+persona state |

---

## Task 1: Chat Models

**Files:**
- Create: `client/src/app/core/models/chat.model.ts`
- Modify: `client/src/app/core/models/onboarding.model.ts`

- [ ] **Step 1: Create chat model types**

```typescript
// client/src/app/core/models/chat.model.ts
import type { components } from './api.generated';

// Re-export server types for convenience
export type ApiChatMessage = components['schemas']['ChatMessage'];
export type ApiChatRequest = components['schemas']['ChatRequest'];
export type ApiPortfolio = components['schemas']['Portfolio'];
export type ApiHolding = components['schemas']['Holding'];
export type ApiAssetContext = components['schemas']['AssetContext'];

export type ChatMode = 'onboarding' | 'common' | 'asset';
export type Persona = 'beginner' | 'experienced';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming: boolean;
  isPortfolioReady: boolean;
}

export interface ChatConfig {
  mode: ChatMode;
  persona: Persona;
  asset?: { ticker: string; name: string };
}

export interface SuggestionChip {
  label: string;
}

export interface ThinkingPhrase {
  text: string;
}
```

- [ ] **Step 2: Add deviceId to STORAGE_KEYS**

In `client/src/app/core/models/onboarding.model.ts`, add to the `STORAGE_KEYS` object:

```typescript
export const STORAGE_KEYS = {
  onboardingComplete: '8f_onboarding_complete',
  investmentProfile: '8f_investment_profile',
  subscriptionStatus: '8f_subscription_status',
  deviceId: '8f_device_id',
} as const;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx tsc --noEmit`
Expected: No errors related to chat.model.ts

- [ ] **Step 4: Commit**

```bash
git add client/src/app/core/models/chat.model.ts client/src/app/core/models/onboarding.model.ts
git commit -m "client: add chat model types and deviceId storage key"
```

---

## Task 2: Device Service

**Files:**
- Create: `client/src/app/core/services/device.service.ts`
- Create: `client/src/app/core/services/device.service.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
// client/src/app/core/services/device.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';

// Mock Capacitor Preferences
const mockPreferences = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('@capacitor/preferences', () => ({
  Preferences: mockPreferences,
}));

describe('DeviceService', () => {
  let service: DeviceService;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceService);
  });

  it('should generate a UUID v4 format device ID', () => {
    const id = service.deviceId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should return the same ID on subsequent calls', () => {
    const id1 = service.deviceId();
    const id2 = service.deviceId();
    expect(id1).toBe(id2);
  });

  it('should load persisted ID on init', async () => {
    const persistedId = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';
    mockPreferences.get.mockResolvedValue({ value: persistedId });

    const freshService = TestBed.inject(DeviceService);
    await freshService.init();

    expect(freshService.deviceId()).toBe(persistedId);
  });

  it('should persist new ID to Capacitor Preferences', async () => {
    mockPreferences.get.mockResolvedValue({ value: null });

    await service.init();

    expect(mockPreferences.set).toHaveBeenCalledWith({
      key: '8f_device_id',
      value: service.deviceId(),
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=device.service.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement DeviceService**

```typescript
// client/src/app/core/services/device.service.ts
import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from '@app/core/models/onboarding.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly _deviceId = signal<string>(crypto.randomUUID());

  readonly deviceId = this._deviceId.asReadonly();

  async init(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.deviceId });
      if (value) {
        this._deviceId.set(value);
      } else {
        await Preferences.set({
          key: STORAGE_KEYS.deviceId,
          value: this._deviceId(),
        });
      }
    } catch {
      // Browser without Capacitor — ID stays in memory, that's fine
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=device.service.spec.ts`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/app/core/services/device.service.ts client/src/app/core/services/device.service.spec.ts
git commit -m "client: add DeviceService for anonymous device ID management"
```

---

## Task 3: Device ID HTTP Interceptor

**Files:**
- Create: `client/src/app/core/interceptors/device-id.interceptor.ts`
- Create: `client/src/app/core/interceptors/device-id.interceptor.spec.ts`
- Modify: `client/src/app/app.config.ts`

- [ ] **Step 1: Write failing test**

```typescript
// client/src/app/core/interceptors/device-id.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { deviceIdInterceptor } from './device-id.interceptor';
import { DeviceService } from '@app/core/services/device.service';

describe('deviceIdInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  const mockDeviceId = 'test-device-id-1234';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([deviceIdInterceptor])),
        provideHttpClientTesting(),
        {
          provide: DeviceService,
          useValue: { deviceId: () => mockDeviceId },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add X-Device-ID header to requests', () => {
    httpClient.get('/api/v1/portfolio').subscribe();

    const req = httpTesting.expectOne('/api/v1/portfolio');
    expect(req.request.headers.get('X-Device-ID')).toBe(mockDeviceId);
    req.flush({});
  });

  it('should not add header to non-API requests', () => {
    httpClient.get('/assets/image.png').subscribe();

    const req = httpTesting.expectOne('/assets/image.png');
    expect(req.request.headers.has('X-Device-ID')).toBe(false);
    req.flush({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=device-id.interceptor.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement interceptor**

```typescript
// client/src/app/core/interceptors/device-id.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DeviceService } from '@app/core/services/device.service';

export const deviceIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const deviceService = inject(DeviceService);
  const cloned = req.clone({
    setHeaders: { 'X-Device-ID': deviceService.deviceId() },
  });

  return next(cloned);
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=device-id.interceptor.spec.ts`
Expected: All 2 tests PASS

- [ ] **Step 5: Register interceptor in app config**

Read `client/src/app/app.config.ts` first. Then add `withInterceptors([deviceIdInterceptor])` to the `provideHttpClient()` call. If `provideHttpClient` is not yet in the providers, add it:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { deviceIdInterceptor } from '@app/core/interceptors/device-id.interceptor';

// In providers array, add or update:
provideHttpClient(withInterceptors([deviceIdInterceptor])),
```

Also call `DeviceService.init()` in the app initializer or at app bootstrap. Add to providers:

```typescript
import { APP_INITIALIZER } from '@angular/core';
import { DeviceService } from '@app/core/services/device.service';

// In providers array:
{
  provide: APP_INITIALIZER,
  useFactory: (deviceService: DeviceService) => () => deviceService.init(),
  deps: [DeviceService],
  multi: true,
},
```

- [ ] **Step 6: Verify build compiles**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add client/src/app/core/interceptors/ client/src/app/app.config.ts
git commit -m "client: add device ID interceptor for X-Device-ID header on API calls"
```

---

## Task 4: Portfolio Service

**Files:**
- Create: `client/src/app/core/services/portfolio.service.ts`
- Create: `client/src/app/core/services/portfolio.service.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// client/src/app/core/services/portfolio.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import type { ApiPortfolio } from '@app/core/models/chat.model';

const mockPortfolio: ApiPortfolio = {
  holdings: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      quantity: 50,
      cost_basis: 175.2,
      current_price: 198.45,
      value: 9922.5,
      daily_change_percent: 1.24,
    },
  ],
  total_value: 9922.5,
  daily_change: 122.5,
  daily_change_percent: 1.25,
};

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioService);
  });

  it('should start with null portfolio', () => {
    expect(service.portfolio()).toBeNull();
  });

  it('should set portfolio and update signal', () => {
    service.setPortfolio(mockPortfolio);
    expect(service.portfolio()).toEqual(mockPortfolio);
  });

  it('should persist portfolio to localStorage', () => {
    service.setPortfolio(mockPortfolio);
    const stored = localStorage.getItem('8f_portfolio');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(mockPortfolio);
  });

  it('should load portfolio from localStorage on init', () => {
    localStorage.setItem('8f_portfolio', JSON.stringify(mockPortfolio));
    service.loadFromStorage();
    expect(service.portfolio()).toEqual(mockPortfolio);
  });

  it('should have hasPortfolio computed signal', () => {
    expect(service.hasPortfolio()).toBe(false);
    service.setPortfolio(mockPortfolio);
    expect(service.hasPortfolio()).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=portfolio.service.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement PortfolioService**

```typescript
// client/src/app/core/services/portfolio.service.ts
import { computed, Injectable, signal } from '@angular/core';
import type { ApiPortfolio } from '@app/core/models/chat.model';

const STORAGE_KEY = '8f_portfolio';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly _portfolio = signal<ApiPortfolio | null>(null);

  readonly portfolio = this._portfolio.asReadonly();
  readonly hasPortfolio = computed(() => this._portfolio() !== null);

  constructor() {
    this.loadFromStorage();
  }

  setPortfolio(portfolio: ApiPortfolio): void {
    this._portfolio.set(portfolio);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Storage full or unavailable — signal still has the data
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._portfolio.set(JSON.parse(stored) as ApiPortfolio);
      }
    } catch {
      // Corrupt data — start fresh
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=portfolio.service.spec.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/app/core/services/portfolio.service.ts client/src/app/core/services/portfolio.service.spec.ts
git commit -m "client: add PortfolioService with signal state and localStorage persistence"
```

---

## Task 5: Chat Constants

**Files:**
- Create: `client/src/app/features/chat/constants/thinking-phrases.ts`
- Create: `client/src/app/features/chat/constants/suggestion-chips.ts`
- Create: `client/src/app/features/chat/constants/initial-greetings.ts`

- [ ] **Step 1: Create thinking phrases**

```typescript
// client/src/app/features/chat/constants/thinking-phrases.ts
import type { ChatMode } from '@app/core/models/chat.model';

const ONBOARDING_PHRASES = [
  'Getting to know your portfolio...',
  'Setting things up...',
  'Mapping out your investments...',
  'Putting the pieces together...',
  'Building your profile...',
];

const COMMON_PHRASES = [
  'Analyzing your portfolio...',
  'Crunching the numbers...',
  'Reviewing your holdings...',
  'Digging into the data...',
  'Checking the details...',
];

const ASSET_PHRASES = [
  'Looking into {TICKER}...',
  'Pulling up {TICKER} details...',
  'Researching {TICKER}...',
  'Analyzing {TICKER} performance...',
];

const PHRASES: Record<ChatMode, string[]> = {
  onboarding: ONBOARDING_PHRASES,
  common: COMMON_PHRASES,
  asset: ASSET_PHRASES,
};

export function getRandomThinkingPhrase(mode: ChatMode, ticker?: string): string {
  const pool = PHRASES[mode];
  const phrase = pool[Math.floor(Math.random() * pool.length)];
  return ticker ? phrase.replace('{TICKER}', ticker) : phrase;
}
```

- [ ] **Step 2: Create suggestion chips**

```typescript
// client/src/app/features/chat/constants/suggestion-chips.ts
import type { ChatMode, Persona, SuggestionChip } from '@app/core/models/chat.model';

type ChipKey = `${ChatMode}_${Persona}` | ChatMode;

const CHIPS: Record<ChipKey, SuggestionChip[]> = {
  onboarding_beginner: [
    { label: 'I own some stocks' },
    { label: 'I have crypto' },
    { label: 'Help me get started' },
    { label: 'What should I invest in?' },
  ],
  onboarding_experienced: [
    { label: 'Here are my holdings' },
    { label: 'Import from spreadsheet' },
    { label: 'I hold ETFs and stocks' },
  ],
  common: [
    { label: 'Portfolio health check' },
    { label: 'Risk analysis' },
    { label: 'Top performers' },
    { label: 'Diversification report' },
  ],
  asset: [
    { label: 'Recent performance' },
    { label: 'Compare to sector' },
    { label: "What's the outlook?" },
    { label: 'Position sizing' },
  ],
};

export function getSuggestionChips(mode: ChatMode, persona: Persona): SuggestionChip[] {
  if (mode === 'onboarding') {
    return CHIPS[`onboarding_${persona}`];
  }
  return CHIPS[mode];
}
```

- [ ] **Step 3: Create initial greetings**

```typescript
// client/src/app/features/chat/constants/initial-greetings.ts
import type { ChatMode, Persona } from '@app/core/models/chat.model';

type GreetingKey = `${ChatMode}_${Persona}`;

const GREETINGS: Record<GreetingKey, string> = {
  onboarding_beginner:
    "Welcome! Tell me what you're interested in \u2014 stocks, crypto, ETFs \u2014 and I'll help you get started. Even 'I have no idea' is a perfect place to begin.",
  onboarding_experienced:
    "Welcome! Tell me what you're holding \u2014 stocks, ETFs, crypto \u2014 and I'll set up your dashboard. You can be as detailed as you want. Try something like: 'I have 50 shares of AAPL, some VOO, and about $10K in Bitcoin.'",
  common_beginner:
    'Hey! What would you like to know about your portfolio?',
  common_experienced:
    'What would you like to analyze about your portfolio?',
  asset_beginner:
    'What would you like to know about your {TICKER} position?',
  asset_experienced:
    'What would you like to analyze about {TICKER}?',
};

export function getInitialGreeting(mode: ChatMode, persona: Persona, ticker?: string): string {
  const key: GreetingKey = `${mode}_${persona}`;
  const greeting = GREETINGS[key];
  return ticker ? greeting.replace('{TICKER}', ticker) : greeting;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add client/src/app/features/chat/constants/
git commit -m "client: add chat constants — thinking phrases, suggestion chips, initial greetings"
```

---

## Task 6: Chat Service

**Files:**
- Create: `client/src/app/core/services/chat.service.ts`
- Create: `client/src/app/core/services/chat.service.spec.ts`

This is the most complex service. It handles SSE streaming via fetch, message state management with Signals, RAF batching, and `[PORTFOLIO_READY]` detection.

- [ ] **Step 1: Write failing tests**

```typescript
// client/src/app/core/services/chat.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { PortfolioService } from './portfolio.service';
import { DeviceService } from './device.service';
import type { ChatConfig } from '@app/core/models/chat.model';

describe('ChatService', () => {
  let service: ChatService;
  let portfolioService: PortfolioService;

  const config: ChatConfig = {
    mode: 'onboarding',
    persona: 'beginner',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DeviceService,
          useValue: { deviceId: () => 'test-device-id' },
        },
      ],
    });
    service = TestBed.inject(ChatService);
    portfolioService = TestBed.inject(PortfolioService);
  });

  it('should initialize with empty messages', () => {
    service.init(config);
    expect(service.messages().length).toBe(0);
  });

  it('should add initial greeting on init', () => {
    service.init(config);
    service.addInitialGreeting();
    const msgs = service.messages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('assistant');
    expect(msgs[0].isStreaming).toBe(false);
  });

  it('should add user message', () => {
    service.init(config);
    service.addUserMessage('Hello');
    const msgs = service.messages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Hello');
  });

  it('should detect [PORTFOLIO_READY] marker', () => {
    const text = 'Here is your portfolio!\n\n[PORTFOLIO_READY]\n<portfolio_data>\n{"holdings":[],"total_value":0,"daily_change":0,"daily_change_percent":0}\n</portfolio_data>';
    const result = service.parsePortfolioReady(text);
    expect(result.hasPortfolio).toBe(true);
    expect(result.cleanContent).toBe('Here is your portfolio!');
    expect(result.portfolio).toBeDefined();
    expect(result.portfolio!.holdings).toEqual([]);
  });

  it('should return no portfolio when marker absent', () => {
    const text = 'Just a normal response';
    const result = service.parsePortfolioReady(text);
    expect(result.hasPortfolio).toBe(false);
    expect(result.cleanContent).toBe('Just a normal response');
  });

  it('should parse SSE text into events', () => {
    const sseText = 'event: token\ndata: {"content":"Hello"}\n\nevent: token\ndata: {"content":" world"}\n\nevent: done\ndata: {}\n\n';
    const events = service.parseSSE(sseText);
    expect(events).toEqual([
      { type: 'token', data: { content: 'Hello' } },
      { type: 'token', data: { content: ' world' } },
      { type: 'done', data: {} },
    ]);
  });

  it('should build request body from current state', () => {
    service.init(config);
    service.addUserMessage('test');
    const body = service.buildRequestBody();
    expect(body.mode).toBe('onboarding');
    expect(body.persona).toBe('beginner');
    expect(body.messages.length).toBe(1);
    expect(body.portfolio).toBeDefined();
  });

  it('should track isStreaming state', () => {
    service.init(config);
    expect(service.isStreaming()).toBe(false);
  });

  it('should track isPortfolioReady state', () => {
    service.init(config);
    expect(service.isPortfolioReady()).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=chat.service.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ChatService**

```typescript
// client/src/app/core/services/chat.service.ts
import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { environment } from '@env/environment';
import { PortfolioService } from './portfolio.service';
import { DeviceService } from './device.service';
import { getInitialGreeting } from '@app/features/chat/constants/initial-greetings';
import { getRandomThinkingPhrase } from '@app/features/chat/constants/thinking-phrases';
import type {
  ChatConfig,
  ChatMessage,
  ApiChatRequest,
  ApiChatMessage,
  ApiPortfolio,
} from '@app/core/models/chat.model';

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

interface PortfolioParseResult {
  hasPortfolio: boolean;
  cleanContent: string;
  portfolio?: ApiPortfolio;
}

const EMPTY_PORTFOLIO: ApiPortfolio = {
  holdings: [],
  total_value: 0,
  daily_change: 0,
  daily_change_percent: 0,
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly portfolioService = inject(PortfolioService);
  private readonly deviceService = inject(DeviceService);
  private readonly ngZone = inject(NgZone);

  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isStreaming = signal(false);
  private readonly _isPortfolioReady = signal(false);
  private readonly _thinkingPhrase = signal('');
  private config: ChatConfig | null = null;
  private abortController: AbortController | null = null;

  readonly messages = this._messages.asReadonly();
  readonly isStreaming = this._isStreaming.asReadonly();
  readonly isPortfolioReady = this._isPortfolioReady.asReadonly();
  readonly thinkingPhrase = this._thinkingPhrase.asReadonly();
  readonly canSend = computed(() => !this._isStreaming() && !this._isPortfolioReady());

  init(config: ChatConfig): void {
    this.config = config;
    this._messages.set([]);
    this._isStreaming.set(false);
    this._isPortfolioReady.set(false);
    this._thinkingPhrase.set('');
  }

  addInitialGreeting(): void {
    if (!this.config) return;
    const content = getInitialGreeting(
      this.config.mode,
      this.config.persona,
      this.config.asset?.ticker
    );
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'assistant',
        content,
        timestamp: new Date(),
        isStreaming: false,
        isPortfolioReady: false,
      },
    ]);
  }

  addUserMessage(content: string): void {
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'user',
        content,
        timestamp: new Date(),
        isStreaming: false,
        isPortfolioReady: false,
      },
    ]);
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.config || this._isStreaming() || this._isPortfolioReady()) return;

    this.addUserMessage(content);
    this._isStreaming.set(true);
    this._thinkingPhrase.set(
      getRandomThinkingPhrase(this.config.mode, this.config.asset?.ticker)
    );

    // Add placeholder assistant message
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isPortfolioReady: false,
      },
    ]);

    const body = this.buildRequestBody();
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${environment.apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceService.deviceId(),
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      await this.processStream(response.body);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        this.updateLastAssistantMessage(
          'Sorry, something went wrong. Please try again.',
          false
        );
      }
    } finally {
      this._isStreaming.set(false);
      this._thinkingPhrase.set('');
      this.abortController = null;
    }
  }

  cancelStream(): void {
    this.abortController?.abort();
  }

  buildRequestBody(): ApiChatRequest {
    const messages: ApiChatMessage[] = this._messages()
      .map(m => ({ role: m.role, content: m.content }))
      .filter(m => m.content.length > 0);

    const portfolio = this.portfolioService.portfolio() ?? EMPTY_PORTFOLIO;

    return {
      mode: this.config!.mode,
      persona: this.config!.persona,
      messages,
      portfolio,
      asset: this.config!.asset ?? null,
    };
  }

  parseSSE(text: string): SSEEvent[] {
    const events: SSEEvent[] = [];
    const blocks = text.split('\n\n').filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split('\n');
      let type = '';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          type = line.slice(7);
        } else if (line.startsWith('data: ')) {
          data = line.slice(6);
        }
      }

      if (type && data) {
        try {
          events.push({ type, data: JSON.parse(data) as Record<string, unknown> });
        } catch {
          // Skip malformed events
        }
      }
    }

    return events;
  }

  parsePortfolioReady(text: string): PortfolioParseResult {
    const markerIndex = text.indexOf('[PORTFOLIO_READY]');
    if (markerIndex === -1) {
      return { hasPortfolio: false, cleanContent: text };
    }

    const cleanContent = text.substring(0, markerIndex).trim();
    const dataMatch = text.match(/<portfolio_data>\s*([\s\S]*?)\s*<\/portfolio_data>/);

    if (dataMatch) {
      try {
        const portfolio = JSON.parse(dataMatch[1]) as ApiPortfolio;
        return { hasPortfolio: true, cleanContent, portfolio };
      } catch {
        return { hasPortfolio: true, cleanContent };
      }
    }

    return { hasPortfolio: true, cleanContent };
  }

  private async processStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenBuffer = '';
    let rafPending = false;

    const flushTokens = (): void => {
      if (!tokenBuffer) return;
      const tokens = tokenBuffer;
      tokenBuffer = '';
      rafPending = false;

      this.ngZone.run(() => {
        this._thinkingPhrase.set('');
        this.appendToLastAssistantMessage(tokens);
      });
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = this.parseSSE(buffer);

        // Keep any incomplete event at the end of buffer
        const lastDoubleNewline = buffer.lastIndexOf('\n\n');
        if (lastDoubleNewline !== -1) {
          buffer = buffer.substring(lastDoubleNewline + 2);
        }

        for (const event of events) {
          if (event.type === 'token') {
            tokenBuffer += (event.data as { content: string }).content;
            if (!rafPending) {
              rafPending = true;
              requestAnimationFrame(flushTokens);
            }
          } else if (event.type === 'done') {
            // Flush any remaining tokens
            flushTokens();
            this.finalizeAssistantMessage();
          } else if (event.type === 'error') {
            flushTokens();
            const errorMsg = (event.data as { message: string }).message;
            this.updateLastAssistantMessage(
              `Error: ${errorMsg}`,
              false
            );
          }
        }
      }

      // Flush remaining buffer
      if (tokenBuffer) {
        flushTokens();
      }
    } finally {
      reader.releaseLock();
    }
  }

  private appendToLastAssistantMessage(text: string): void {
    this._messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content: last.content + text };
      }
      return updated;
    });
  }

  private updateLastAssistantMessage(content: string, isStreaming: boolean): void {
    this._messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content, isStreaming };
      }
      return updated;
    });
  }

  private finalizeAssistantMessage(): void {
    const msgs = this._messages();
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== 'assistant') return;

    const parseResult = this.parsePortfolioReady(last.content);

    if (parseResult.hasPortfolio && parseResult.portfolio) {
      this.portfolioService.setPortfolio(parseResult.portfolio);
      this._isPortfolioReady.set(true);

      // Save to server
      this.savePortfolioToServer(parseResult.portfolio);

      this._messages.update(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: parseResult.cleanContent,
          isStreaming: false,
          isPortfolioReady: true,
        };
        return updated;
      });
    } else {
      this._messages.update(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isStreaming: false,
        };
        return updated;
      });
    }
  }

  private async savePortfolioToServer(portfolio: ApiPortfolio): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/api/v1/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceService.deviceId(),
        },
        body: JSON.stringify(portfolio),
      });
    } catch {
      // Server save failed — local cache is the fallback
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=chat.service.spec.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/app/core/services/chat.service.ts client/src/app/core/services/chat.service.spec.ts
git commit -m "client: add ChatService with SSE streaming, RAF batching, and portfolio-ready detection"
```

---

## Task 7: Portfolio Summary Card Component

**Files:**
- Create: `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.ts`
- Create: `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.html`
- Create: `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.scss`
- Create: `client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
// client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.spec.ts
import { render, screen } from '@testing-library/angular';
import { PortfolioSummaryCardComponent } from './portfolio-summary-card.component';
import type { ApiPortfolio } from '@app/core/models/chat.model';

const mockPortfolio: ApiPortfolio = {
  holdings: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      quantity: 50,
      cost_basis: 175.2,
      current_price: 198.45,
      value: 9922.5,
      daily_change_percent: 1.24,
    },
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      exchange: 'CRYPTO',
      quantity: 0.5,
      cost_basis: 42000,
      current_price: 67000,
      value: 33500,
      daily_change_percent: -2.1,
    },
  ],
  total_value: 43422.5,
  daily_change: 312.5,
  daily_change_percent: 0.73,
};

describe('PortfolioSummaryCardComponent', () => {
  it('should display total portfolio value', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText(/\$43,422/)).toBeTruthy();
  });

  it('should list holdings with tickers', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('BTC')).toBeTruthy();
  });

  it('should show CTA button', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText(/See your dashboard/)).toBeTruthy();
  });

  it('should emit ctaClick on button tap', async () => {
    const { fixture } = await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    const spy = jest.fn();
    fixture.componentInstance.ctaClick.subscribe(spy);

    const button = screen.getByText(/See your dashboard/);
    button.click();
    expect(spy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=portfolio-summary-card`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component**

```typescript
// client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { ApiPortfolio } from '@app/core/models/chat.model';

@Component({
  selector: 'app-portfolio-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './portfolio-summary-card.component.html',
  styleUrl: './portfolio-summary-card.component.scss',
})
export class PortfolioSummaryCardComponent {
  readonly portfolio = input.required<ApiPortfolio>();
  readonly ctaClick = output<void>();

  onCtaTap(): void {
    this.ctaClick.emit();
  }
}
```

```html
<!-- client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.html -->
<div class="portfolio-card">
  <div class="card-header">
    <span class="card-label">YOUR PORTFOLIO</span>
    <span class="total-value">{{ portfolio().total_value | currency:'USD':'symbol':'1.0-0' }}</span>
  </div>

  <div class="holdings-list">
    @for (holding of portfolio().holdings; track holding.ticker) {
      <div class="holding-row">
        <span class="ticker">{{ holding.ticker }}</span>
        <span class="value">{{ holding.value | currency:'USD':'symbol':'1.0-0' }}</span>
      </div>
    }
  </div>

  <button class="cta-button" (click)="onCtaTap()">
    See your dashboard &rarr;
  </button>
</div>
```

```scss
// client/src/app/features/chat/components/portfolio-summary-card/portfolio-summary-card.component.scss
.portfolio-card {
  background: rgba(53, 52, 55, 0.4);
  border: 1px solid var(--color-border-accent);
  border-radius: 16px;
  padding: 20px;
  margin-top: 12px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.card-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-warm-chat);
}

.total-value {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-accent-highlight);
}

.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.holding-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticker {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-accent-highlight);
}

.value {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-warm);
}

.cta-button {
  width: 100%;
  padding: 12px;
  background: var(--gradient-accent);
  border: none;
  border-radius: 9999px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-on-accent-button);
  cursor: pointer;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=portfolio-summary-card`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/app/features/chat/components/portfolio-summary-card/
git commit -m "client: add PortfolioSummaryCard component for inline chat portfolio display"
```

---

## Task 8: Chat Page Component

**Files:**
- Create: `client/src/app/features/chat/chat.page.ts`
- Create: `client/src/app/features/chat/chat.page.html`
- Create: `client/src/app/features/chat/chat.page.scss`

This is the main UI component. It renders the full chat screen matching the Figma design.

- [ ] **Step 1: Create component class**

```typescript
// client/src/app/features/chat/chat.page.ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { ChatService } from '@app/core/services/chat.service';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { getSuggestionChips } from './constants/suggestion-chips';
import { PortfolioSummaryCardComponent } from './components/portfolio-summary-card/portfolio-summary-card.component';
import { PortfolioService } from '@app/core/services/portfolio.service';
import type { ChatConfig, ChatMessage, SuggestionChip } from '@app/core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    PortfolioSummaryCardComponent,
  ],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss',
})
export class ChatPage implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);
  private readonly modalController = inject(ModalController);

  // Modal input — used when opened as modal (common/asset mode)
  readonly config = input<ChatConfig | undefined>(undefined);

  @ViewChild('messageList') private messageList!: ElementRef<HTMLDivElement>;

  readonly messages = this.chatService.messages;
  readonly isStreaming = this.chatService.isStreaming;
  readonly isPortfolioReady = this.chatService.isPortfolioReady;
  readonly thinkingPhrase = this.chatService.thinkingPhrase;
  readonly canSend = this.chatService.canSend;
  readonly portfolio = this.portfolioService.portfolio;

  readonly inputText = signal('');
  private resolvedConfig: ChatConfig | null = null;

  readonly isModal = computed(() =>
    this.resolvedConfig?.mode === 'common' || this.resolvedConfig?.mode === 'asset'
  );

  readonly chips = computed<SuggestionChip[]>(() => {
    if (!this.resolvedConfig) return [];
    return getSuggestionChips(this.resolvedConfig.mode, this.resolvedConfig.persona);
  });

  ngOnInit(): void {
    // Config comes from either modal input or router state
    const modalConfig = this.config();
    if (modalConfig) {
      this.resolvedConfig = modalConfig;
    } else {
      const nav = this.router.getCurrentNavigation();
      const state = nav?.extras?.state as ChatConfig | undefined;
      if (state?.mode) {
        this.resolvedConfig = state;
      } else {
        // Fallback — try to read from history state
        const historyState = history.state as ChatConfig | undefined;
        if (historyState?.mode) {
          this.resolvedConfig = historyState;
        }
      }
    }

    if (!this.resolvedConfig) {
      // No config — fallback to onboarding beginner
      this.resolvedConfig = {
        mode: 'onboarding',
        persona: this.onboardingService.investmentProfile() ?? 'beginner',
      };
    }

    this.chatService.init(this.resolvedConfig);
    this.chatService.addInitialGreeting();
  }

  ngOnDestroy(): void {
    this.chatService.cancelStream();
  }

  async onSend(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || !this.canSend()) return;

    this.inputText.set('');
    await this.chatService.sendMessage(text);
    this.scrollToBottom();
  }

  onChipTap(chip: SuggestionChip): void {
    if (!this.canSend()) return;
    this.inputText.set(chip.label);
    this.onSend();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onBack(): void {
    if (this.isModal()) {
      this.modalController.dismiss();
    } else {
      this.router.navigate(['/onboarding']);
    }
  }

  onPortfolioCta(): void {
    // Navigate to paywall step
    this.onboardingService.nextStep(); // Moves to paywall
    this.router.navigate(['/onboarding']);
  }

  trackByMessage(_index: number, msg: ChatMessage): string {
    return `${msg.role}-${msg.timestamp.getTime()}`;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      const el = this.messageList?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
```

- [ ] **Step 2: Create template**

```html
<!-- client/src/app/features/chat/chat.page.html -->
<div class="chat-container">
  <!-- Header -->
  <div class="chat-header">
    <div class="header-content">
      <div class="header-left">
        <button class="header-button" (click)="onBack()" aria-label="Go back">
          @if (isModal()) {
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="#f2f2f2" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          } @else {
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="#f2f2f2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          }
        </button>
        <span class="header-title">AI Assistant</span>
      </div>
      <div class="header-right">
        <span class="status-dot"></span>
        <span class="status-text">SYSTEM ONLINE</span>
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div class="message-list" #messageList>
    <div class="messages-container">
      @for (message of messages(); track trackByMessage($index, message)) {
        <div class="message-group" [class.user]="message.role === 'user'" [class.assistant]="message.role === 'assistant'">
          @if (message.role === 'assistant') {
            <div class="ai-avatar">
              <div class="avatar-inner"></div>
            </div>
          }
          <div class="message-content">
            <div class="bubble" [class.user-bubble]="message.role === 'user'" [class.ai-bubble]="message.role === 'assistant'">
              @if (message.isStreaming && !message.content) {
                <span class="thinking">{{ thinkingPhrase() }}</span>
              } @else {
                <span class="message-text">{{ message.content }}</span>
              }
            </div>

            @if (message.isPortfolioReady && portfolio()) {
              <app-portfolio-summary-card
                [portfolio]="portfolio()!"
                (ctaClick)="onPortfolioCta()" />
            }

            <div class="timestamp">
              @if (message.role === 'user') {
                {{ message.timestamp | date:'HH:mm' }} &middot; SENT
              } @else {
                {{ message.timestamp | date:'HH:mm' }}
              }
            </div>
          </div>
        </div>
      }
    </div>
  </div>

  <!-- Input Shell -->
  <div class="input-shell" [class.disabled]="isPortfolioReady()">
    <div class="input-row">
      <div class="input-wrapper">
        <input
          type="text"
          class="message-input"
          [value]="inputText()"
          (input)="inputText.set($any($event.target).value)"
          (keydown)="onKeyDown($event)"
          [disabled]="!canSend()"
          placeholder="Ask anything about your vault..."
          autocomplete="off" />
      </div>
      <button
        class="send-button"
        [class.active]="inputText().trim().length > 0"
        [disabled]="!canSend() || !inputText().trim()"
        (click)="onSend()"
        aria-label="Send message">
        <svg width="19" height="16" viewBox="0 0 19 16" fill="none">
          <path d="M1 1L18 8L1 15V9.5L12 8L1 6.5V1Z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    @if (!isPortfolioReady()) {
      <div class="chips-row">
        @for (chip of chips(); track chip.label) {
          <button class="chip" (click)="onChipTap(chip)">
            {{ chip.label }}
          </button>
        }
      </div>
    }
  </div>
</div>
```

Note: The template uses Angular's `date` pipe. Add `DatePipe` to the imports array in the component:

```typescript
import { DatePipe } from '@angular/common';
// add DatePipe to imports array alongside CurrencyPipe is already in sub-component
```

Update the component imports to include `DatePipe`:

```typescript
imports: [
  IonContent,
  IonHeader,
  IonToolbar,
  PortfolioSummaryCardComponent,
  DatePipe,
],
```

- [ ] **Step 3: Create styles**

```scss
// client/src/app/features/chat/chat.page.scss

// ── Layout ──
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
  position: relative;
  overflow: hidden;
}

// ── Header ──
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(3, 3, 4, 0.6);
  border-bottom: 1px solid rgba(247, 147, 26, 0.1);
  box-shadow: 0 20px 40px rgba(247, 147, 26, 0.08);
  padding-top: env(safe-area-inset-top);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  max-width: 1024px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.header-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-text-accent);
  letter-spacing: -0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #e9c400;
  box-shadow: 0 0 8px #e9c400;
}

.status-text {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-warm);
}

// ── Message List ──
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: calc(64px + env(safe-area-inset-top) + 32px) 16px 128px;
  -webkit-overflow-scrolling: touch;

  // Radial gold gradient background
  background:
    radial-gradient(
      ellipse at center,
      rgba(247, 147, 26, 0.04) 0%,
      transparent 70%
    );
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 768px;
}

// ── Message Groups ──
.message-group {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  &.user {
    flex-direction: column;
    align-items: flex-end;
  }

  &.assistant {
    flex-direction: row;
    align-items: flex-start;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user .message-content {
  align-items: flex-end;
}

.assistant .message-content {
  align-items: flex-start;
}

// ── AI Avatar ──
.ai-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 9999px;
  background: #353437;
  border: 1px solid rgba(247, 147, 26, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 30% 40%, rgba(247, 147, 26, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(255, 184, 116, 0.2) 0%, transparent 50%),
    #353437;
}

// ── Bubbles ──
.bubble {
  max-width: 304px;
  position: relative;
}

.user-bubble {
  background: #f7931a;
  color: #603500;
  padding: 16px 24px;
  border-radius: 48px 48px 4px 48px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 22.75px;
}

.ai-bubble {
  background: #1c1b1d;
  color: #e5e1e4;
  padding: 25px;
  border-radius: 4px 48px 48px 48px;
  border: 1px solid rgba(85, 67, 53, 0.15);
  backdrop-filter: blur(6px);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 22.75px;
}

.thinking {
  color: var(--color-text-warm-chat);
  font-style: italic;

  &::after {
    content: '';
    animation: blink 1.2s infinite;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

// ── Timestamps ──
.timestamp {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-warm-chat);
  padding: 0 8px;
  line-height: 15px;
}

// ── Input Shell ──
.input-shell {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #131315;
  border-top: 1px solid rgba(247, 147, 26, 0.15);
  border-radius: 32px 32px 0 0;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: 100;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.input-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.input-wrapper {
  flex: 1;
}

.message-input {
  width: 100%;
  background: #0e0e10;
  border: 1px solid rgba(85, 67, 53, 0.3);
  border-radius: 9999px;
  padding: 18px 25px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  -webkit-appearance: none;

  &::placeholder {
    color: rgba(163, 141, 123, 0.5);
  }

  &:focus {
    border-color: rgba(247, 147, 26, 0.4);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  min-width: 43px;
  border-radius: 9999px;
  background: var(--color-text-secondary);
  border: none;
  color: #000;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;

  &.active {
    background: #f7931a;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
}

// ── Suggestion Chips ──
.chips-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chip {
  flex-shrink: 0;
  background: rgba(32, 31, 33, 0.5);
  border: 1px solid rgba(85, 67, 53, 0.2);
  border-radius: 9999px;
  padding: 7px 17px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-warm);
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: rgba(247, 147, 26, 0.1);
  }
}
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add client/src/app/features/chat/chat.page.ts client/src/app/features/chat/chat.page.html client/src/app/features/chat/chat.page.scss
git commit -m "client: add ChatPage component with Figma-matched dark+gold UI"
```

---

## Task 9: Chat Page Tests

**Files:**
- Create: `client/src/app/features/chat/chat.page.spec.ts`

- [ ] **Step 1: Write component tests**

```typescript
// client/src/app/features/chat/chat.page.spec.ts
import { render, screen } from '@testing-library/angular';
import { ChatPage } from './chat.page';
import { ChatService } from '@app/core/services/chat.service';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { DeviceService } from '@app/core/services/device.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { signal } from '@angular/core';

// Mock Ionic components
jest.mock('@ionic/angular/standalone', () => ({
  IonContent: { selector: 'ion-content', template: '<ng-content/>' },
  IonHeader: { selector: 'ion-header', template: '<ng-content/>' },
  IonToolbar: { selector: 'ion-toolbar', template: '<ng-content/>' },
  ModalController: jest.fn().mockImplementation(() => ({
    dismiss: jest.fn(),
  })),
}));

describe('ChatPage', () => {
  const mockMessages = signal([
    {
      role: 'assistant' as const,
      content: 'Welcome!',
      timestamp: new Date(),
      isStreaming: false,
      isPortfolioReady: false,
    },
  ]);

  const mockChatService = {
    messages: mockMessages,
    isStreaming: signal(false),
    isPortfolioReady: signal(false),
    thinkingPhrase: signal(''),
    canSend: signal(true),
    init: jest.fn(),
    addInitialGreeting: jest.fn(),
    sendMessage: jest.fn(),
    cancelStream: jest.fn(),
  };

  const mockPortfolioService = {
    portfolio: signal(null),
    hasPortfolio: signal(false),
    setPortfolio: jest.fn(),
    loadFromStorage: jest.fn(),
  };

  const mockOnboardingService = {
    investmentProfile: signal('beginner' as const),
    currentStep: signal(2),
    nextStep: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
    getCurrentNavigation: () => ({
      extras: {
        state: { mode: 'onboarding', persona: 'beginner' },
      },
    }),
  };

  it('should render header with AI Assistant title', async () => {
    await render(ChatPage, {
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DeviceService, useValue: { deviceId: () => 'test' } },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: { dismiss: jest.fn() } },
      ],
    });

    expect(screen.getByText('AI Assistant')).toBeTruthy();
    expect(screen.getByText('SYSTEM ONLINE')).toBeTruthy();
  });

  it('should display initial greeting message', async () => {
    await render(ChatPage, {
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DeviceService, useValue: { deviceId: () => 'test' } },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: { dismiss: jest.fn() } },
      ],
    });

    expect(screen.getByText('Welcome!')).toBeTruthy();
  });

  it('should render input field with placeholder', async () => {
    await render(ChatPage, {
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DeviceService, useValue: { deviceId: () => 'test' } },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: { dismiss: jest.fn() } },
      ],
    });

    const input = screen.getByPlaceholderText('Ask anything about your vault...');
    expect(input).toBeTruthy();
  });

  it('should init chat service on mount', async () => {
    await render(ChatPage, {
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DeviceService, useValue: { deviceId: () => 'test' } },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: { dismiss: jest.fn() } },
      ],
    });

    expect(mockChatService.init).toHaveBeenCalledWith({
      mode: 'onboarding',
      persona: 'beginner',
    });
    expect(mockChatService.addInitialGreeting).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --testPathPattern=chat.page.spec.ts`
Expected: All 4 tests PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/app/features/chat/chat.page.spec.ts
git commit -m "client: add ChatPage component tests"
```

---

## Task 10: Route Registration & Navigation Wiring

**Files:**
- Modify: `client/src/app/app.routes.ts`
- Modify: `client/src/app/features/onboarding/onboarding.page.ts`

- [ ] **Step 1: Add chat route**

In `client/src/app/app.routes.ts`, add the `/chat` route:

```typescript
import { Routes } from '@angular/router';
import { onboardingGuard } from '@app/core/guards/onboarding.guard';
import { onboardingRedirectGuard } from '@app/core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.page').then(m => m.OnboardingPage),
    canActivate: [onboardingRedirectGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/chat.page').then(m => m.ChatPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/onboarding/components/home-placeholder.component').then(m => m.HomePlaceholderComponent),
    canActivate: [onboardingGuard],
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];
```

- [ ] **Step 2: Wire bridge continue to chat navigation**

In `client/src/app/features/onboarding/onboarding.page.ts`, modify `onContinue()` so that when the current step is Bridge, it navigates to `/chat` instead of advancing to paywall:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { OnboardingStep, ONBOARDING_TOTAL_STEPS } from '@app/core/models/onboarding.model';
import { OnboardingHookComponent } from './components/hook/onboarding-hook.component';
import { OnboardingPromiseComponent } from './components/promise/onboarding-promise.component';
import { OnboardingBridgeComponent } from './components/bridge/onboarding-bridge.component';
import { PaywallComponent } from './components/paywall/paywall.component';
import { PageIndicatorComponent } from '@app/shared/components/page-indicator/page-indicator.component';
import { stepTransition } from './animations/onboarding.animations';
import type { ChatConfig } from '@app/core/models/chat.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnboardingHookComponent,
    OnboardingPromiseComponent,
    OnboardingBridgeComponent,
    PaywallComponent,
    PageIndicatorComponent,
  ],
  animations: [stepTransition],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPage {
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);

  readonly currentStep = this.onboardingService.currentStep;
  readonly totalSteps = ONBOARDING_TOTAL_STEPS;
  readonly Step = OnboardingStep;

  onContinue(): void {
    if (this.currentStep() === OnboardingStep.Bridge) {
      // Navigate to chat with onboarding config
      const persona = this.onboardingService.investmentProfile() ?? 'beginner';
      const config: ChatConfig = { mode: 'onboarding', persona };
      this.router.navigate(['/chat'], { state: config });
    } else {
      this.onboardingService.nextStep();
    }
  }

  onBack(): void {
    this.onboardingService.previousStep();
  }

  async onComplete(): Promise<void> {
    await this.router.navigate(['/home']);
  }
}
```

- [ ] **Step 3: Verify build compiles**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run all tests**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest`
Expected: All tests PASS

- [ ] **Step 5: Run linter**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx ng lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add client/src/app/app.routes.ts client/src/app/features/onboarding/onboarding.page.ts
git commit -m "client: wire chat route and bridge→chat navigation with onboarding config"
```

---

## Task 11: Integration Verification

This task verifies the full flow works end-to-end.

- [ ] **Step 1: Build the client**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx ng build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run all client tests**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx jest --coverage`
Expected: All tests pass, coverage above 80% for new files

- [ ] **Step 3: Run linter**

Run: `cd /Users/artemkulikov/Documents/8figures-be/client && npx ng lint`
Expected: Clean

- [ ] **Step 4: Visual verification checklist**

Start server and client:
```bash
cd /Users/artemkulikov/Documents/8figures-be/server && source .venv/bin/activate && uvicorn main:app --reload --port 8000 &
cd /Users/artemkulikov/Documents/8figures-be/client && npx ng serve
```

Verify in browser at `http://localhost:4200`:
1. Onboarding flow: Hook → Promise → Bridge → select profile → Continue → Chat opens
2. Chat header: "AI Assistant" in gold, "SYSTEM ONLINE" with green dot, back arrow
3. Initial greeting appears as AI bubble with avatar
4. Suggestion chips visible below input
5. Type message → send → thinking phrase → streamed response appears
6. User bubble: gold with dark text, rounded (flat bottom-right)
7. AI bubble: dark with warm white text, rounded (flat bottom-left)
8. Timestamps in JetBrains Mono below messages
9. Input: dark pill shape, gold send button when text present
10. In onboarding mode, after AI sends `[PORTFOLIO_READY]`: summary card appears, input disabled, CTA button visible

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "client: integration fixes for AI agent chat feature"
```
