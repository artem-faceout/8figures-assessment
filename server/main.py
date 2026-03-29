import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.common import ApiError, ApiErrorResponse
from routers.chat import router as chat_router
from routers.portfolio import router as portfolio_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="8Figures Portfolio API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "capacitor://localhost",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router)
app.include_router(chat_router)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=ApiErrorResponse(
            error=ApiError(code="AI_SERVICE_ERROR", message=str(exc))
        ).model_dump(mode="json"),
    )


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
