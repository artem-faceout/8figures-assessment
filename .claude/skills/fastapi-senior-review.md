# Skill: FastAPI Senior Review

## When to use
After implementing any FastAPI/Python code. This catches patterns that separate senior from junior work.

## Project Structure

- [ ] Routers handle HTTP concerns only (request/response, status codes, auth)
- [ ] Business logic lives in `services/` — routers call services, never contain logic
- [ ] Data access in `data/` layer — services don't know about file I/O or database details
  - **Why:** Layer separation. Swapping mock data for a real DB should only change `data/`, not services.
- [ ] Models split by domain (`models/portfolio.py`, `models/chat.py`) — not one giant `models.py`
- [ ] No circular imports between layers

## Dependency Injection

- [ ] Uses FastAPI `Depends()` for service injection — not global imports
  - **Bad:** `from services.portfolio import portfolio_service` then use directly
  - **Good:**
    ```python
    def get_portfolio_service() -> PortfolioService:
        return PortfolioService()

    @router.get("/")
    async def get_portfolio(service: PortfolioService = Depends(get_portfolio_service)):
    ```
  - **Why:** Testable, swappable, explicit about dependencies. This is how production FastAPI works.
- [ ] Dependencies compose — service depends on data layer via Depends, not direct import
- [ ] Shared dependencies use `Annotated` type alias for DRY injection
  ```python
  PortfolioServiceDep = Annotated[PortfolioService, Depends(get_portfolio_service)]
  ```

## Async Discipline

- [ ] All endpoint handlers are `async def`
- [ ] No blocking calls inside `async def` handlers
  - **Bad:** `open("file.json").read()` in an async handler — blocks the event loop
  - **Good:** Use `aiofiles` or run in executor: `await asyncio.to_thread(blocking_fn)`
  - **Why:** One blocking call stalls ALL concurrent requests in the async loop
- [ ] External API calls use async clients
  - Anthropic SDK: use `AsyncAnthropic()`, not `Anthropic()`
  - HTTP calls: use `httpx.AsyncClient`, not `requests`
- [ ] File I/O uses `aiofiles` or `asyncio.to_thread()`

## Pydantic v2 Patterns

- [ ] Models inherit from `BaseModel`, not `dataclass`
- [ ] Uses `model_validator` for cross-field validation
  ```python
  @model_validator(mode="after")
  def validate_gain_loss(self) -> Self:
      expected = (self.current_price - self.cost_basis) * self.quantity
      if abs(self.gain_loss - expected) > 0.01:
          raise ValueError("gain_loss does not match computed value")
      return self
  ```
- [ ] Uses `field_validator` for single-field rules
- [ ] Uses `Field()` with descriptions for API documentation
  ```python
  ticker: str = Field(..., description="Stock ticker symbol", examples=["AAPL"])
  ```
- [ ] Response models are separate from internal models
  - **Why:** Internal models may have fields you don't want to expose (costs, internal IDs)
- [ ] Uses `ConfigDict` for model configuration (not inner `class Config`)
  ```python
  model_config = ConfigDict(from_attributes=True, frozen=True)
  ```

## Configuration

- [ ] Environment config uses `pydantic-settings`, not raw `os.getenv()`
  ```python
  from pydantic_settings import BaseSettings

  class Settings(BaseSettings):
      anthropic_api_key: str
      debug: bool = False
      cors_origins: list[str] = ["http://localhost:4200"]

      model_config = SettingsConfigDict(env_file=".env")
  ```
  - **Why:** Type-safe, validated at startup, documented, testable
- [ ] Settings injected via `Depends()`, not imported globally
- [ ] Sensitive values never have defaults — app fails fast if missing

## Error Handling

- [ ] Custom exception classes for domain errors
  ```python
  class PortfolioNotFoundError(Exception):
      pass
  ```
- [ ] Exception handlers registered on the app for consistent error responses
  ```python
  @app.exception_handler(PortfolioNotFoundError)
  async def portfolio_not_found_handler(request, exc):
      return JSONResponse(status_code=404, content={"detail": str(exc)})
  ```
- [ ] Never return raw 500 errors — catch and wrap unexpected exceptions
- [ ] Streaming endpoints handle errors mid-stream (send error event, close cleanly)
- [ ] No bare `except:` — always catch specific exceptions

## Type Hints

- [ ] Every function has full type hints (params + return)
- [ ] Uses modern syntax: `list[str]` not `List[str]`, `str | None` not `Optional[str]`
- [ ] Uses `Annotated` for dependency injection types
- [ ] Return types on all endpoints: `-> PortfolioResponse` or `-> StreamingResponse`

## Logging

- [ ] Uses Python `logging` module — NOT `print()`
- [ ] Logger per module: `logger = logging.getLogger(__name__)`
- [ ] Structured context in log messages
  ```python
  logger.info("Portfolio fetched", extra={"holdings_count": len(holdings)})
  ```
- [ ] Log levels used correctly: DEBUG for dev tracing, INFO for events, WARNING for recoverable issues, ERROR for failures
- [ ] No sensitive data in logs (API keys, full request bodies)

## Streaming (SSE)

- [ ] Uses `StreamingResponse` with `text/event-stream` media type
- [ ] SSE format is correct: `data: {json}\n\n` (double newline)
- [ ] Stream includes error events, not just success
- [ ] Generator function handles client disconnect (check if client is still connected)
- [ ] Uses async generator (`async def generate()` + `yield`) — not sync
- [ ] Includes `[DONE]` sentinel event for clean client-side termination

## Testing Considerations

- [ ] Services are testable without FastAPI (plain Python classes)
- [ ] Dependencies are swappable via `app.dependency_overrides`
- [ ] No global mutable state — everything flows through DI

## Security

- [ ] API keys loaded from environment, never hardcoded
- [ ] CORS origins are explicit — no `allow_origins=["*"]` in production
- [ ] Input validation via Pydantic — never trust raw request data
- [ ] Rate limiting considered for AI chat endpoint (expensive API calls)
- [ ] No SQL injection risk (if DB is added later — use parameterized queries)

## What senior FastAPI looks like (reference)

```python
# routers/portfolio.py
from typing import Annotated
from fastapi import APIRouter, Depends

from models.portfolio import PortfolioResponse
from services.portfolio_service import PortfolioService

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])

PortfolioServiceDep = Annotated[PortfolioService, Depends(PortfolioService)]

@router.get("/", response_model=PortfolioResponse)
async def get_portfolio(service: PortfolioServiceDep) -> PortfolioResponse:
    """Get the user's current portfolio with all holdings."""
    return await service.get_portfolio()


# services/portfolio_service.py
import logging
from models.portfolio import PortfolioResponse, HoldingResponse
from data.mock_portfolio import MockPortfolioRepository

logger = logging.getLogger(__name__)

class PortfolioService:
    def __init__(self) -> None:
        self.repository = MockPortfolioRepository()

    async def get_portfolio(self) -> PortfolioResponse:
        holdings = await self.repository.get_holdings()
        logger.info("Portfolio retrieved", extra={"count": len(holdings)})
        return PortfolioResponse(
            holdings=holdings,
            total_value=sum(h.market_value for h in holdings),
        )
```
