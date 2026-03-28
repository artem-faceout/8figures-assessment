# Skill: Performance Patterns — Keeping the App Smooth

## When to use
When implementing any feature that involves data processing, user input, lists, animations, streaming, or external API calls. Apply these patterns proactively — don't wait for jank to appear.

## Client — Main Thread Protection

JavaScript is single-threaded. Everything that blocks the main thread blocks the UI — no scrolling, no taps, no animations. The budget is 16ms per frame (60fps).

### Web Workers for Heavy Computation

Move CPU-intensive work off the main thread:
- Portfolio calculations (totals, gain/loss across many holdings)
- Sorting/filtering large datasets
- Data transformation before rendering

```typescript
// worker/portfolio.worker.ts
addEventListener('message', ({ data }) => {
  const holdings = data as Holding[];
  const result = {
    totalValue: holdings.reduce((sum, h) => sum + h.marketValue, 0),
    totalGainLoss: holdings.reduce((sum, h) => sum + h.gainLoss, 0),
    sorted: [...holdings].sort((a, b) => b.marketValue - a.marketValue),
  };
  postMessage(result);
});

// In component
private readonly worker = new Worker(new URL('./portfolio.worker', import.meta.url));

constructor() {
  this.worker.onmessage = ({ data }) => {
    this.portfolioSummary.set(data);
  };
}
```

**Rule of thumb:** If a computation touches >100 items or takes >5ms, move it to a Worker.

### Debouncing User Input

Never fire an API call on every keystroke:

```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

// Chat input — wait 300ms after user stops typing
this.searchInput.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.service.search(query)),
  takeUntilDestroyed(this.destroyRef),
).subscribe(results => this.results.set(results));
```

**Thresholds:**
- Search/filter input: 300ms debounce
- Chat send button: no debounce (user expects instant), but disable button during send
- Scroll-based loading: 100ms throttle

### Virtual Scrolling for Long Lists

If a list can grow beyond ~20 visible items, use virtual scrolling — only render what's on screen:

```html
<!-- Ionic virtual scroll -->
<ion-content>
  <ion-list>
    @for (holding of visibleHoldings(); track holding.ticker) {
      <app-holding-card [holding]="holding" />
    }
  </ion-list>
  <ion-infinite-scroll (ionInfinite)="loadMore($event)">
    <ion-infinite-scroll-content />
  </ion-infinite-scroll>
</ion-content>
```

For truly large lists (1000+ items), use CDK virtual scroll:
```html
<cdk-virtual-scroll-viewport itemSize="72" class="holdings-list">
  <app-holding-card *cdkVirtualFor="let holding of holdings()" [holding]="holding" />
</cdk-virtual-scroll-viewport>
```

### Lazy Loading with @defer

Don't load what the user can't see yet:

```html
<!-- Load insights panel only when scrolled into view -->
@defer (on viewport) {
  <app-insights-panel [holdings]="holdings()" />
} @placeholder {
  <ion-skeleton-text [animated]="true" style="height: 200px" />
} @loading (minimum 200ms) {
  <ion-spinner />
}
```

**When to use @defer:**
- Below-the-fold content
- Tabs that aren't initially visible
- Heavy components (charts, analytics)
- Secondary features (insights, settings)

### Optimistic UI Updates

Show the result immediately, reconcile with server in background:

```typescript
// Chat — show user message instantly, don't wait for server
sendMessage(text: string): void {
  // Optimistic: add to UI immediately
  this.messages.update(msgs => [...msgs, { role: 'user', text, status: 'sent' }]);

  // Then send to server
  this.chatService.send(text).pipe(
    takeUntilDestroyed(this.destroyRef),
  ).subscribe({
    error: () => {
      // Mark message as failed, let user retry
      this.messages.update(msgs =>
        msgs.map(m => m.text === text ? { ...m, status: 'failed' } : m)
      );
    },
  });
}
```

### Streaming Chunk Rendering

For AI chat streaming, don't update the signal on every single chunk — batch updates:

```typescript
private renderBuffer = '';
private frameId: number | null = null;

onStreamChunk(chunk: string): void {
  this.renderBuffer += chunk;

  // Batch render at 60fps, not per-chunk
  if (!this.frameId) {
    this.frameId = requestAnimationFrame(() => {
      this.currentResponse.update(text => text + this.renderBuffer);
      this.renderBuffer = '';
      this.frameId = null;
    });
  }
}
```

**Why:** Streaming can produce 50+ chunks/second. Updating a signal 50 times/second triggers 50 change detection cycles. Batching via `requestAnimationFrame` limits to 60fps max.

### OnPush + Signals = Minimal Re-renders

This combination is the foundation:
- `ChangeDetectionStrategy.OnPush` — component only re-checks when inputs change or signals update
- `computed()` — derived values recalculate only when dependencies change, not on every CD cycle
- `@for ... track` — only re-renders changed list items, not the entire list

These aren't optional performance optimizations — they're the baseline.

## Server — Async and Resource Management

### Async Client Lifecycle

Create API clients once, reuse across requests — don't create per-request:

```python
# services/ai_service.py
from anthropic import AsyncAnthropic

class AIService:
    def __init__(self) -> None:
        # Single client instance, reused across requests
        self._client = AsyncAnthropic()

    async def stream_chat(self, message: str, context: str) -> AsyncGenerator[str, None]:
        async with self._client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": message}],
            system=context,
        ) as stream:
            async for text in stream.text_stream:
                yield text
```

### Background Tasks

For operations the user doesn't need to wait for:

```python
from fastapi import BackgroundTasks

@router.post("/api/v1/chat")
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    service: AIServiceDep,
) -> StreamingResponse:
    # Log analytics in background — don't slow down the response
    background_tasks.add_task(log_chat_interaction, request.message)
    return StreamingResponse(service.stream_chat(request.message), media_type="text/event-stream")
```

### Streaming Backpressure

Don't generate faster than the client can consume:

```python
async def generate_stream(message: str) -> AsyncGenerator[str, None]:
    async for chunk in self._client.messages.stream(...).text_stream:
        yield f"data: {json.dumps({'text': chunk})}\n\n"
        # asyncio.sleep(0) yields control to event loop
        # Allows FastAPI to check if client disconnected
        await asyncio.sleep(0)
    yield "data: [DONE]\n\n"
```

### Don't Block the Event Loop

Common traps:

```python
# BAD — blocks event loop, stalls ALL requests
data = json.loads(open("data/portfolio.json").read())

# GOOD — async file I/O
import aiofiles
async with aiofiles.open("data/portfolio.json") as f:
    data = json.loads(await f.read())

# GOOD — offload to thread pool for quick operations
import asyncio
data = await asyncio.to_thread(load_portfolio_from_file)
```

## Performance Checklist

### Client
- [ ] No computation >5ms on main thread — use Web Workers
- [ ] User input debounced (300ms for search, 100ms for scroll)
- [ ] Lists >20 items use virtual scroll or infinite scroll
- [ ] Below-fold content uses `@defer (on viewport)`
- [ ] Streaming updates batched via `requestAnimationFrame`
- [ ] All components use `OnPush` change detection
- [ ] All list renders use `track` in `@for`
- [ ] No synchronous heavy work in `computed()` signals
- [ ] Images use `loading="lazy"`
- [ ] Optimistic UI for user-initiated actions (chat send, refresh)

### Server
- [ ] API clients created once, not per-request
- [ ] All I/O is async (no blocking file reads, no `requests` library)
- [ ] Background tasks used for non-critical operations
- [ ] Streaming includes `await asyncio.sleep(0)` for backpressure
- [ ] No CPU-heavy sync code in async handlers
