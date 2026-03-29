import logging
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse, StreamingResponse

from models.chat import ChatRequest
from models.common import ApiError, ApiErrorResponse
from services.ai_service import AiService

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["chat"])


def get_ai_service() -> AiService:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or api_key == "sk-ant-your-key-here":
        raise ValueError("ANTHROPIC_API_KEY not configured")
    return AiService(api_key=api_key)


@router.post("/chat", response_model=None)
async def chat(
    request: ChatRequest,
    ai_service: AiService = Depends(get_ai_service),
    x_device_id: str | None = Header(default=None),
) -> StreamingResponse | JSONResponse:
    if not x_device_id:
        return JSONResponse(
            status_code=400,
            content=ApiErrorResponse(
                error=ApiError(
                    code="MISSING_DEVICE_ID",
                    message="X-Device-ID header is required",
                )
            ).model_dump(mode="json"),
        )

    logger.info("Chat request from device %s, mode=%s", x_device_id, request.mode)

    return StreamingResponse(
        ai_service.stream_response(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
