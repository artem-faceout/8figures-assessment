from typing import Literal

from pydantic import BaseModel, Field, model_validator

from models.portfolio import AssetContext, Portfolio


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"] = Field(description="Message sender")
    content: str = Field(min_length=1, description="Message text content")


class ChatRequest(BaseModel):
    mode: Literal["onboarding", "common", "asset"] = Field(description="Chat mode")
    persona: Literal["beginner", "experienced"] = Field(
        description="User's investment profile"
    )
    messages: list[ChatMessage] = Field(
        max_length=100, description="Conversation history"
    )
    portfolio: Portfolio = Field(description="Current portfolio state")
    asset: AssetContext | None = Field(
        default=None, description="Focused asset (required for asset mode)"
    )

    @model_validator(mode="after")
    def asset_required_for_asset_mode(self) -> "ChatRequest":
        if self.mode == "asset" and self.asset is None:
            raise ValueError("asset is required when mode is 'asset'")
        return self


class SSETokenEvent(BaseModel):
    content: str


class SSEDoneEvent(BaseModel):
    pass


class SSEErrorEvent(BaseModel):
    message: str
