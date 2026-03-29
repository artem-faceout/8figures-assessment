from datetime import datetime, timezone
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Meta(BaseModel):
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Response timestamp in UTC",
    )


class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: Meta = Field(default_factory=Meta)


class ApiError(BaseModel):
    code: str = Field(description="Machine-readable UPPER_SNAKE_CASE error code")
    message: str = Field(description="Human-readable error description")
    details: dict = Field(default_factory=dict, description="Optional additional context")


class ApiErrorResponse(BaseModel):
    error: ApiError
