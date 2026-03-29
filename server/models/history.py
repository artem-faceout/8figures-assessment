from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class TimeRange(StrEnum):
    ONE_WEEK = "1W"
    ONE_MONTH = "1M"
    THREE_MONTHS = "3M"
    ONE_YEAR = "1Y"
    ALL = "ALL"


class PricePoint(BaseModel):
    timestamp: datetime = Field(description="Point in time for this price")
    price: float = Field(ge=0, description="Price at this timestamp")


class PriceHistory(BaseModel):
    ticker: str = Field(min_length=1, description="Asset identifier")
    range: TimeRange = Field(description="Time range for this history")
    points: list[PricePoint] = Field(
        min_length=1, description="Ordered price points (oldest first)"
    )
