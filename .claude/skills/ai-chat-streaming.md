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
import anthropic

@router.post("/api/v1/chat")
async def chat(request: ChatRequest):
    client = anthropic.Anthropic()

    async def generate():
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": request.message}],
            system=build_system_prompt(request.portfolio_context)
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

## Client side (Angular)

- Use `fetch()` with ReadableStream for SSE (not HttpClient — it doesn't support streaming well)
- Append chunks to a Signal holding the current response
- Show typing indicator while streaming
- Auto-scroll chat to bottom on new chunks

## Portfolio context

- Include current holdings summary in system prompt
- Format: "User holds: AAPL (50 shares, $10,250), GOOGL (10 shares, $1,780)…"
- This makes AI responses contextual to the user's actual portfolio

## Checklist

- [ ] Streaming works end-to-end (not waiting for full response)
- [ ] API key is ONLY on server, never in client code
- [ ] Error handling for API failures
- [ ] Typing indicator during streaming
- [ ] Chat history maintained in component state
- [ ] Messages are scrollable and mobile-friendly
