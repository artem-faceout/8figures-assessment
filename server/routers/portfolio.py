from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse

from data.mock_metrics import MOCK_METRICS
from data.mock_portfolio import MOCK_PORTFOLIO
from models.common import ApiError, ApiErrorResponse, ApiResponse
from models.portfolio import AssetMetrics, Portfolio
from services.portfolio_store import get_portfolio, save_portfolio

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
