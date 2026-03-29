from pydantic import BaseModel, Field


class PortfolioInsight(BaseModel):
    ticker: str = Field(min_length=1, description="Which asset the insight is about")
    asset_name: str = Field(min_length=1, description="Full asset name")
    headline: str = Field(min_length=1, description="Short ALL-CAPS headline")
    body: str = Field(min_length=1, description="1-2 sentence factual insight")
