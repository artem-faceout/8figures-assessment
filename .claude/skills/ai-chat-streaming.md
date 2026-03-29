# Skill: AI Chat with Streaming

## When to use

When implementing or modifying the AI chat feature.

## Architecture

- Client sends user message to server via POST
- Server proxies to Claude API with streaming enabled
- Server streams response back to client via SSE (Server-Sent Events)
- Client renders chunks progressively (character-by-character or chunk-by-chunk)

## Server side (FastAPI)

```python
from fastapi.responses import StreamingResponse
from anthropic import AsyncAnthropic
import json
from datetime import datetime

@router.post("/api/v1/chat")
async def chat(request: ChatRequest, service: AIServiceDep):
    async def generate():
        try:
            async for text in service.stream_chat(request.message, request.portfolio_context):
                yield f"data: {json.dumps({'type': 'chunk', 'text': text})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'meta': {'timestamp': datetime.utcnow().isoformat() + 'Z'}})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': {'code': 'AI_SERVICE_ERROR', 'message': str(e)}})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

SSE events follow `skills/api-contract-patterns.md` — typed with `type` discriminator (`chunk`, `done`, `error`).

## Client side (Angular)

- Use `fetch()` with ReadableStream for SSE (not HttpClient — it doesn't support streaming well)
- Append chunks to a Signal holding the current response
- Show typing indicator while streaming
- Auto-scroll chat to bottom on new chunks

## Portfolio context

- Include current holdings summary in system prompt
- Format: "User holds: AAPL (50 shares, $10,250), GOOGL (10 shares, $1,780)…"
- This makes AI responses contextual to the user's actual portfolio

## Related patterns

- Chunk batching via `requestAnimationFrame`: see `skills/performance-patterns.md` → "Streaming Chunk Rendering"
- Signal update discipline during streaming: see `skills/angular-senior-review.md` → "Signals" section
- Server async discipline and backpressure: see `skills/fastapi-senior-review.md` → "Streaming (SSE)" section

## Checklist

- [ ] Streaming works end-to-end (not waiting for full response)
- [ ] API key is ONLY on server, never in client code
- [ ] Error handling for API failures
- [ ] Typing indicator during streaming
- [ ] Chat history maintained in component state
- [ ] Messages are scrollable and mobile-friendly
