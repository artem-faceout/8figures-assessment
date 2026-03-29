"""AI service — builds prompts, manages sliding window, streams Anthropic responses."""

import json
import logging
from collections.abc import AsyncIterator

import anthropic

from models.chat import ChatMessage, ChatRequest
from services.prompt_templates import build_system_prompt

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1024
TEMPERATURE = 0.7
MAX_PAIRS = 10  # sliding window: last 10 user+assistant pairs


def trim_messages(messages: list[ChatMessage], max_pairs: int = MAX_PAIRS) -> list[ChatMessage]:
    """Keep the last `max_pairs * 2` messages (sliding window)."""
    max_count = max_pairs * 2
    if len(messages) <= max_count:
        return messages
    return messages[-max_count:]


class AiService:
    def __init__(self, api_key: str) -> None:
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    async def stream_response(self, request: ChatRequest) -> AsyncIterator[str]:
        """Stream SSE-formatted events from Anthropic API."""
        # Build system prompt
        portfolio_json = request.portfolio.model_dump_json()
        system_prompt = build_system_prompt(
            mode=request.mode,
            persona=request.persona,
            portfolio_json=portfolio_json,
            asset_ticker=request.asset.ticker if request.asset else None,
            asset_name=request.asset.name if request.asset else None,
        )

        # Trim messages to sliding window
        trimmed = trim_messages(request.messages)
        api_messages = [{"role": m.role, "content": m.content} for m in trimmed]

        try:
            async with self.client.messages.stream(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                system=system_prompt,
                messages=api_messages,
            ) as stream:
                async for event in stream:
                    if event.type == "content_block_delta" and event.delta.type == "text_delta":
                        sse_data = json.dumps({"content": event.delta.text})
                        yield f"event: token\ndata: {sse_data}\n\n"

            yield "event: done\ndata: {}\n\n"

        except anthropic.APIError as e:
            logger.error("Anthropic API error: %s", e)
            error_data = json.dumps({"message": str(e)})
            yield f"event: error\ndata: {error_data}\n\n"
        except Exception as e:
            logger.error("Unexpected error in AI service: %s", e)
            error_data = json.dumps({"message": "An unexpected error occurred"})
            yield f"event: error\ndata: {error_data}\n\n"
