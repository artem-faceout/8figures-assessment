import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pydantic import ValidationError

from models.insight import PortfolioInsight


class TestPortfolioInsightModel:
    def test_valid_insight(self):
        insight = PortfolioInsight(
            ticker="AAPL",
            asset_name="Apple Inc.",
            headline="AAPL HITS NEW HIGHS",
            body="Apple reached a 52-week high.",
        )
        assert insight.ticker == "AAPL"

    def test_empty_headline_rejected(self):
        with pytest.raises(ValidationError):
            PortfolioInsight(
                ticker="AAPL",
                asset_name="Apple Inc.",
                headline="",
                body="Some body text.",
            )

    def test_empty_body_rejected(self):
        with pytest.raises(ValidationError):
            PortfolioInsight(
                ticker="AAPL",
                asset_name="Apple Inc.",
                headline="SOME HEADLINE",
                body="",
            )


class TestInsightEndpoint:
    @pytest.mark.asyncio
    async def test_insight_returns_200_with_mocked_ai(self, client):
        mock_response = MagicMock()
        mock_response.content = [
            MagicMock(
                text=json.dumps(
                    {
                        "headline": "AAPL STRONG MOMENTUM",
                        "body": "Apple is showing strong momentum this quarter.",
                    }
                )
            )
        ]

        mock_client_instance = AsyncMock()
        mock_client_instance.messages.create = AsyncMock(return_value=mock_response)

        with (
            patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}),
            patch(
                "services.insight_service.anthropic.AsyncAnthropic",
                return_value=mock_client_instance,
            ),
        ):
            resp = await client.get("/api/v1/portfolio/insight")
            assert resp.status_code == 200
            data = resp.json()["data"]
            assert "ticker" in data
            assert "headline" in data
            assert "body" in data

    @pytest.mark.asyncio
    async def test_insight_fails_without_api_key(self, client):
        with patch.dict("os.environ", {}, clear=True):
            resp = await client.get("/api/v1/portfolio/insight")
            assert resp.status_code == 500
            assert resp.json()["error"]["code"] == "AI_SERVICE_ERROR"

    @pytest.mark.asyncio
    async def test_insight_handles_ai_error(self, client):
        mock_client_instance = AsyncMock()
        mock_client_instance.messages.create = AsyncMock(
            side_effect=Exception("API failure")
        )

        with (
            patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}),
            patch(
                "services.insight_service.anthropic.AsyncAnthropic",
                return_value=mock_client_instance,
            ),
        ):
            resp = await client.get("/api/v1/portfolio/insight")
            assert resp.status_code == 500
            assert resp.json()["error"]["code"] == "AI_SERVICE_ERROR"
