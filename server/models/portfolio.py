from pydantic import BaseModel, Field


class Holding(BaseModel):
    ticker: str = Field(min_length=1, max_length=10, description="Asset ticker symbol")
    name: str = Field(min_length=1, description="Full asset name")
    exchange: str = Field(min_length=1, description="Exchange name")
    quantity: float = Field(gt=0, description="Number of shares/units held")
    cost_basis: float = Field(ge=0, description="Average cost per share")
    current_price: float = Field(ge=0, description="Current market price per share")
    value: float = Field(ge=0, description="Total position value")
    daily_change_percent: float = Field(description="Daily price change as percentage")


class Portfolio(BaseModel):
    holdings: list[Holding] = Field(default_factory=list, description="List of investment positions")
    total_value: float = Field(ge=0, description="Sum of all holding values")
    daily_change: float = Field(description="Total dollar change today")
    daily_change_percent: float = Field(description="Total percentage change today")


class AssetMetrics(BaseModel):
    ticker: str = Field(description="Asset identifier")
    pe_ratio: float | None = Field(default=None, description="Price-to-earnings ratio")
    market_cap: str = Field(description="Human-readable market cap")
    day_range_low: float = Field(ge=0, description="Day's lowest price")
    day_range_high: float = Field(ge=0, description="Day's highest price")
    volume: str = Field(description="Human-readable trading volume")


class AssetContext(BaseModel):
    ticker: str = Field(min_length=1, description="Asset ticker symbol")
    name: str = Field(min_length=1, description="Asset full name")
