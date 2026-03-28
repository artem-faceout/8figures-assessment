# Skill: FastAPI Testing Patterns

## When to use
When writing tests for FastAPI endpoints, services, or models. Uses pytest + httpx.

## Setup
- Test runner: pytest with `pytest-asyncio` (auto mode)
- HTTP client: `httpx.AsyncClient` with `ASGITransport`
- Coverage: `pytest-cov` (80% minimum threshold)
- Test files: in `tests/` directory, mirroring source structure
- All tests are async by default (`asyncio_mode = "auto"`)

## Endpoint Tests

```python
# tests/test_portfolio.py
from httpx import AsyncClient


async def test_get_portfolio_returns_200(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio")
    assert response.status_code == 200


async def test_get_portfolio_returns_holdings(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio")
    data = response.json()
    assert "holdings" in data
    assert "total_value" in data
    assert isinstance(data["holdings"], list)


async def test_get_portfolio_holdings_have_required_fields(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio")
    holding = response.json()["holdings"][0]
    required = {"ticker", "name", "quantity", "current_price", "market_value", "gain_loss"}
    assert required.issubset(holding.keys())


async def test_nonexistent_endpoint_returns_404(client: AsyncClient) -> None:
    response = await client.get("/api/v1/nonexistent")
    assert response.status_code == 404
```

## Service Tests

Services are plain Python — no FastAPI dependency needed:

```python
# tests/test_portfolio_service.py
from services.portfolio_service import PortfolioService


async def test_portfolio_service_returns_holdings() -> None:
    service = PortfolioService()
    portfolio = await service.get_portfolio()
    assert len(portfolio.holdings) > 0


async def test_portfolio_total_value_matches_sum() -> None:
    service = PortfolioService()
    portfolio = await service.get_portfolio()
    expected = sum(h.market_value for h in portfolio.holdings)
    assert abs(portfolio.total_value - expected) < 0.01


async def test_portfolio_gain_loss_computed_correctly() -> None:
    service = PortfolioService()
    portfolio = await service.get_portfolio()
    for holding in portfolio.holdings:
        expected = (holding.current_price - holding.cost_basis) * holding.quantity
        assert abs(holding.gain_loss - expected) < 0.01
```

## Pydantic Model Tests

```python
# tests/test_models.py
import pytest
from pydantic import ValidationError
from models.portfolio import Holding, PortfolioResponse


def test_holding_requires_positive_quantity() -> None:
    with pytest.raises(ValidationError):
        Holding(ticker="AAPL", name="Apple", quantity=-1, cost_basis=150.0, current_price=175.0)


def test_holding_computes_market_value() -> None:
    holding = Holding(ticker="AAPL", name="Apple", quantity=10, cost_basis=150.0, current_price=175.0)
    assert holding.market_value == 1750.0


def test_portfolio_response_serialization() -> None:
    data = PortfolioResponse(holdings=[], total_value=0.0)
    json_data = data.model_dump()
    assert "holdings" in json_data
    assert "total_value" in json_data
```

## Streaming Endpoint Tests

```python
# tests/test_chat.py
from httpx import AsyncClient


async def test_chat_returns_sse_stream(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/chat",
        json={"message": "Hello", "portfolio_context": []},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream; charset=utf-8"


async def test_chat_rejects_empty_message(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/chat",
        json={"message": "", "portfolio_context": []},
    )
    assert response.status_code == 422
```

## Fixtures (conftest.py)

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_holdings() -> list[dict]:
    return [
        {
            "ticker": "AAPL",
            "name": "Apple Inc.",
            "quantity": 50,
            "cost_basis": 150.00,
            "current_price": 175.50,
        },
        {
            "ticker": "GOOGL",
            "name": "Alphabet Inc.",
            "quantity": 10,
            "cost_basis": 140.00,
            "current_price": 152.30,
        },
    ]
```

## Mocking External APIs

Never call real Anthropic API in tests:

```python
# tests/conftest.py
from unittest.mock import AsyncMock, patch


@pytest.fixture
def mock_anthropic():
    with patch("services.ai_service.AsyncAnthropic") as mock:
        client = AsyncMock()
        mock.return_value = client
        # Configure stream mock
        client.messages.stream.return_value.__aenter__.return_value.text_stream = [
            "Here", " is", " a", " response"
        ]
        yield client
```

## Test Organization

```
server/tests/
├── __init__.py
├── conftest.py               ← shared fixtures
├── test_health.py            ← health endpoint
├── test_portfolio.py         ← portfolio endpoints
├── test_portfolio_service.py ← portfolio business logic
├── test_chat.py              ← chat/streaming endpoints
├── test_models.py            ← Pydantic model validation
└── test_ai_service.py        ← AI service with mocked API
```

## Running

```bash
pytest -v                     # verbose output
pytest --tb=short             # shorter tracebacks
pytest --cov                  # with coverage
pytest --cov --cov-report=html  # HTML coverage report
pytest -k "test_portfolio"    # run only matching tests
```

## Checklist
- [ ] Every endpoint has at least: happy path, error case, validation test
- [ ] Services tested independently (no HTTP, no FastAPI)
- [ ] Pydantic models tested for validation rules
- [ ] External APIs mocked (never real calls in tests)
- [ ] Async throughout (no sync tests mixed in)
- [ ] `pytest --cov` shows >80% on business logic
- [ ] No test depends on execution order
