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

## API Contract

- **Every response** wrapped in `ApiResponse[T]` envelope — see `skills/api-contract-patterns.md`
- **Every error** uses `ApiErrorResponse` with machine-readable code
- **Streaming** uses typed SSE events: `chunk`, `done`, `error`
- **Pydantic models are the source of truth** — client TypeScript types auto-generated from OpenAPI spec
- After adding/changing models: client runs `npm run generate:types` to regenerate

## Testing (pytest)

- Config: `pyproject.toml` (asyncio_mode = auto)
- Fixtures: `tests/conftest.py` (async httpx client)
- All tests async — uses `pytest-asyncio`
- Run: `pytest -v` / `pytest --cov` / `pytest --cov --cov-report=html`
- Coverage target: >80% (enforced in pyproject.toml)
- Mock external APIs (Anthropic) — never call real API in tests
- Test structure: `tests/test_<module>.py` mirroring source

## AI Integration

- Use `anthropic` Python SDK
- API key from environment variable `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-20250514` (or latest available)
- System prompt includes portfolio context for relevant answers
- Stream via `client.messages.stream()`
