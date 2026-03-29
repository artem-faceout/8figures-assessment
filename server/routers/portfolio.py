import logging
import os

from fastapi import APIRouter, Header, Query
from fastapi.responses import JSONResponse

from data.mock_metrics import MOCK_METRICS
from data.mock_portfolio import MOCK_PORTFOLIO
from models.common import ApiError, ApiErrorResponse, ApiResponse
from models.history import PriceHistory, TimeRange
from models.insight import PortfolioInsight
from models.portfolio import AssetMetrics, Portfolio
from services.history_service import generate_price_history
from services.insight_service import generate_insight
from services.portfolio_store import get_portfolio, save_portfolio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


def _missing_device_id_response() -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=ApiErrorResponse(
            error=ApiError(
                code="MISSING_DEVICE_ID",
                message="X-Device-ID header is required",
            )
        ).model_dump(mode="json"),
    )


@router.get("", response_model=None)
async def get_portfolio_endpoint(
    x_device_id: str | None = Header(default=None),
) -> ApiResponse[Portfolio] | JSONResponse:
    if not x_device_id:
        return _missing_device_id_response()

    saved = get_portfolio(x_device_id)
    return ApiResponse(data=saved if saved else MOCK_PORTFOLIO)


@router.post("", status_code=201, response_model=None)
async def save_portfolio_endpoint(
    portfolio: Portfolio,
    x_device_id: str | None = Header(default=None),
) -> ApiResponse[dict] | JSONResponse:
    if not x_device_id:
        return _missing_device_id_response()

    save_portfolio(x_device_id, portfolio)
    return ApiResponse(data={"saved": True})


@router.get("/insight", response_model=ApiResponse[PortfolioInsight])
async def get_portfolio_insight() -> ApiResponse[PortfolioInsight] | JSONResponse:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return JSONResponse(
            status_code=500,
            content=ApiErrorResponse(
                error=ApiError(
                    code="AI_SERVICE_ERROR",
                    message="AI service is not configured",
                )
            ).model_dump(mode="json"),
        )
    try:
        insight = await generate_insight(MOCK_PORTFOLIO.holdings, api_key)
        return ApiResponse(data=insight)
    except Exception as e:
        logger.error("Insight generation failed: %s", e)
        return JSONResponse(
            status_code=500,
            content=ApiErrorResponse(
                error=ApiError(
                    code="AI_SERVICE_ERROR",
                    message="Failed to generate insight",
                )
            ).model_dump(mode="json"),
        )


@router.get("/{ticker}/history", response_model=ApiResponse[PriceHistory])
async def get_price_history(
    ticker: str,
    range: TimeRange = Query(default=TimeRange.ONE_MONTH, description="Time range"),
) -> ApiResponse[PriceHistory] | JSONResponse:
    ticker_upper = ticker.upper()
    holding = next(
        (h for h in MOCK_PORTFOLIO.holdings if h.ticker == ticker_upper), None
    )
    if not holding:
        return JSONResponse(
            status_code=404,
            content=ApiErrorResponse(
                error=ApiError(
                    code="ASSET_NOT_FOUND",
                    message=f"No data found for ticker '{ticker}'",
                )
            ).model_dump(mode="json"),
        )
    history = generate_price_history(ticker_upper, holding.current_price, range)
    return ApiResponse(data=history)


@router.get("/{ticker}/metrics", response_model=ApiResponse[AssetMetrics])
async def get_asset_metrics(ticker: str) -> ApiResponse[AssetMetrics] | JSONResponse:
    metrics = MOCK_METRICS.get(ticker.upper())
    if not metrics:
        return JSONResponse(
            status_code=404,
            content=ApiErrorResponse(
                error=ApiError(
                    code="ASSET_NOT_FOUND",
                    message=f"No metrics found for ticker '{ticker}'",
                )
            ).model_dump(mode="json"),
        )
    return ApiResponse(data=metrics)
