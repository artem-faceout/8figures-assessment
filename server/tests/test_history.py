from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from models.history import PriceHistory, PricePoint, TimeRange
from services.history_service import generate_price_history


class TestPricePointModel:
    def test_valid_price_point(self):
        point = PricePoint(
            timestamp=datetime(2026, 3, 1, tzinfo=timezone.utc), price=198.45
        )
        assert point.price == 198.45

    def test_negative_price_rejected(self):
        with pytest.raises(ValidationError):
            PricePoint(
                timestamp=datetime(2026, 3, 1, tzinfo=timezone.utc), price=-1.0
            )


class TestPriceHistoryModel:
    def test_valid_history(self):
        history = PriceHistory(
            ticker="AAPL",
            range=TimeRange.ONE_MONTH,
            points=[
                PricePoint(
                    timestamp=datetime(2026, 3, 1, tzinfo=timezone.utc), price=190.0
                )
            ],
        )
        assert history.ticker == "AAPL"
        assert history.range == "1M"

    def test_empty_ticker_rejected(self):
        with pytest.raises(ValidationError):
            PriceHistory(
                ticker="",
                range=TimeRange.ONE_WEEK,
                points=[
                    PricePoint(
                        timestamp=datetime(2026, 3, 1, tzinfo=timezone.utc),
                        price=100.0,
                    )
                ],
            )

    def test_empty_points_rejected(self):
        with pytest.raises(ValidationError):
            PriceHistory(ticker="AAPL", range=TimeRange.ONE_WEEK, points=[])

    def test_invalid_range_rejected(self):
        with pytest.raises(ValidationError):
            PriceHistory(
                ticker="AAPL",
                range="2W",
                points=[
                    PricePoint(
                        timestamp=datetime(2026, 3, 1, tzinfo=timezone.utc),
                        price=100.0,
                    )
                ],
            )


class TestHistoryService:
    @pytest.mark.parametrize(
        "time_range,expected_points",
        [
            (TimeRange.ONE_WEEK, 7),
            (TimeRange.ONE_MONTH, 30),
            (TimeRange.THREE_MONTHS, 90),
            (TimeRange.ONE_YEAR, 252),
            (TimeRange.ALL, 500),
        ],
    )
    def test_generates_correct_number_of_points(self, time_range, expected_points):
        history = generate_price_history("AAPL", 198.45, time_range)
        assert len(history.points) == expected_points

    def test_points_ordered_oldest_first(self):
        history = generate_price_history("AAPL", 198.45, TimeRange.ONE_WEEK)
        timestamps = [p.timestamp for p in history.points]
        assert timestamps == sorted(timestamps)

    def test_last_point_near_current_price(self):
        history = generate_price_history("AAPL", 198.45, TimeRange.ONE_WEEK)
        last_price = history.points[-1].price
        assert abs(last_price - 198.45) / 198.45 < 0.05  # within 5%

    def test_all_prices_positive(self):
        history = generate_price_history("BTC", 68475.0, TimeRange.ALL)
        assert all(p.price > 0 for p in history.points)

    def test_consistent_for_same_ticker(self):
        h1 = generate_price_history("AAPL", 198.45, TimeRange.ONE_MONTH)
        h2 = generate_price_history("AAPL", 198.45, TimeRange.ONE_MONTH)
        assert [p.price for p in h1.points] == [p.price for p in h2.points]

    def test_different_tickers_different_data(self):
        h1 = generate_price_history("AAPL", 198.45, TimeRange.ONE_MONTH)
        h2 = generate_price_history("MSFT", 198.45, TimeRange.ONE_MONTH)
        assert [p.price for p in h1.points] != [p.price for p in h2.points]


class TestHistoryEndpoint:
    @pytest.mark.asyncio
    async def test_get_history_success(self, client):
        resp = await client.get("/api/v1/portfolio/AAPL/history?range=1W")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["ticker"] == "AAPL"
        assert data["range"] == "1W"
        assert len(data["points"]) == 7

    @pytest.mark.asyncio
    async def test_get_history_default_range(self, client):
        resp = await client.get("/api/v1/portfolio/AAPL/history")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["range"] == "1M"
        assert len(data["points"]) == 30

    @pytest.mark.asyncio
    async def test_get_history_unknown_ticker(self, client):
        resp = await client.get("/api/v1/portfolio/FAKE/history")
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "ASSET_NOT_FOUND"

    @pytest.mark.asyncio
    async def test_get_history_invalid_range(self, client):
        resp = await client.get("/api/v1/portfolio/AAPL/history?range=2W")
        assert resp.status_code == 422
