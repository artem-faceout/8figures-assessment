# Server — FastAPI (Python 3.11+)

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API docs

Auto-generated at http://localhost:8000/docs (Swagger UI)

## Structure

```
server/
├── main.py              # FastAPI app, CORS, router registration
├── requirements.txt     # Dependencies
├── .env                 # API keys (gitignored)
├── models/              # Pydantic models
│   ├── portfolio.py     # Portfolio, Holding models
│   └── chat.py          # ChatRequest, ChatResponse models
├── routers/             # API route handlers
│   ├── portfolio.py     # GET /api/v1/portfolio
│   └── chat.py          # POST /api/v1/chat (streaming)
├── services/            # Business logic
│   └── ai_service.py    # Claude API integration
└── data/
    └── mock_portfolio.py  # Mock portfolio data
```

## Rules

- All endpoints async
- All request/response use Pydantic models
- Prefix: `/api/v1/`
- CORS origins: `http://localhost:4200`, `capacitor://localhost`, `http://localhost`
- Never commit `.env` — it's in `.gitignore`
- Streaming responses use `StreamingResponse` with `text/event-stream`

## AI Integration

- Use `anthropic` Python SDK
- API key from environment variable `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-20250514` (or latest available)
- System prompt includes portfolio context for relevant answers
- Stream via `client.messages.stream()`
