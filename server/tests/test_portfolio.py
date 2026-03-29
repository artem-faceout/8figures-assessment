import pytest
from httpx import AsyncClient

from services.portfolio_store import _store


DEVICE_HEADERS = {"X-Device-ID": "test-device-001"}


@pytest.fixture(autouse=True)
def clear_store():
    _store.clear()
    yield
    _store.clear()


# ── GET /api/v1/portfolio ────────────────────────────────────────────────────

async def test_get_portfolio_returns_envelope(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio", headers=DEVICE_HEADERS)
    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "meta" in body
    assert "timestamp" in body["meta"]


async def test_get_portfolio_has_holdings(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio", headers=DEVICE_HEADERS)
    data = response.json()["data"]
    assert "holdings" in data
    assert len(data["holdings"]) == 5
    assert "total_value" in data
    assert "daily_change" in data
    assert "daily_change_percent" in data


async def test_get_portfolio_holding_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio", headers=DEVICE_HEADERS)
    holding = response.json()["data"]["holdings"][0]
    expected_fields = {
        "ticker", "name", "exchange", "quantity",
        "cost_basis", "current_price", "value", "daily_change_percent",
    }
    assert expected_fields.issubset(holding.keys())


async def test_get_portfolio_known_tickers(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio", headers=DEVICE_HEADERS)
    tickers = [h["ticker"] for h in response.json()["data"]["holdings"]]
    assert set(tickers) == {"AAPL", "MSFT", "VOO", "NVDA", "BTC"}


async def test_get_portfolio_missing_device_id_returns_400(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "MISSING_DEVICE_ID"


async def test_get_portfolio_returns_saved_over_mock(client: AsyncClient) -> None:
    # Save a custom portfolio first
    custom_portfolio = {
        "holdings": [
            {
                "ticker": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ",
                "quantity": 10, "cost_basis": 200.00, "current_price": 250.00,
                "value": 2500.00, "daily_change_percent": 3.0,
            }
        ],
        "total_value": 2500.00,
        "daily_change": 75.00,
        "daily_change_percent": 3.0,
    }
    await client.post("/api/v1/portfolio", json=custom_portfolio, headers=DEVICE_HEADERS)

    # GET should return saved, not mock
    response = await client.get("/api/v1/portfolio", headers=DEVICE_HEADERS)
    assert response.status_code == 200
    tickers = [h["ticker"] for h in response.json()["data"]["holdings"]]
    assert tickers == ["TSLA"]


# ── POST /api/v1/portfolio ───────────────────────────────────────────────────

async def test_post_portfolio_saves_successfully(client: AsyncClient) -> None:
    body = {
        "holdings": [
            {
                "ticker": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ",
                "quantity": 50, "cost_basis": 175.20, "current_price": 198.45,
                "value": 9922.50, "daily_change_percent": 1.24,
            }
        ],
        "total_value": 9922.50,
        "daily_change": 120.00,
        "daily_change_percent": 1.22,
    }
    response = await client.post("/api/v1/portfolio", json=body, headers=DEVICE_HEADERS)
    assert response.status_code == 201
    assert response.json()["data"]["saved"] is True
    assert "meta" in response.json()


async def test_post_portfolio_missing_device_id(client: AsyncClient) -> None:
    body = {
        "holdings": [
            {
                "ticker": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ",
                "quantity": 50, "cost_basis": 175.20, "current_price": 198.45,
                "value": 9922.50, "daily_change_percent": 1.24,
            }
        ],
        "total_value": 9922.50,
        "daily_change": 120.00,
        "daily_change_percent": 1.22,
    }
    response = await client.post("/api/v1/portfolio", json=body)
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "MISSING_DEVICE_ID"


async def test_post_portfolio_invalid_body(client: AsyncClient) -> None:
    response = await client.post("/api/v1/portfolio", json={"bad": "data"}, headers=DEVICE_HEADERS)
    assert response.status_code == 422


# ── GET /api/v1/portfolio/{ticker}/metrics (unchanged — no device ID needed) ──

async def test_get_metrics_known_ticker(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio/AAPL/metrics")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["ticker"] == "AAPL"
    assert body["data"]["pe_ratio"] == 32.1
    assert "market_cap" in body["data"]
    assert "meta" in body


async def test_get_metrics_unknown_ticker_404(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio/ZZZZ/metrics")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "ASSET_NOT_FOUND"


async def test_get_metrics_btc_no_pe_ratio(client: AsyncClient) -> None:
    response = await client.get("/api/v1/portfolio/BTC/metrics")
    assert response.status_code == 200
    assert response.json()["data"]["pe_ratio"] is None
