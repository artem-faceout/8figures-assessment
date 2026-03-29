import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from models.chat import ChatMessage, ChatRequest
from models.portfolio import Holding, Portfolio
from services.ai_service import AiService, trim_messages
from services.prompt_templates import build_system_prompt


# ── Fixtures ─────────────────────────────────────────────────────────────────

def _make_portfolio() -> Portfolio:
    return Portfolio(
        holdings=[
            Holding(
                ticker="AAPL", name="Apple Inc.", exchange="NASDAQ",
                quantity=50, cost_basis=175.20, current_price=198.45,
                value=9922.50, daily_change_percent=1.24,
            ),
        ],
        total_value=9922.50,
        daily_change=120.00,
        daily_change_percent=1.22,
    )


def _make_request(
    mode: str = "common",
    persona: str = "beginner",
    num_messages: int = 2,
) -> ChatRequest:
    messages = []
    for i in range(num_messages):
        role = "user" if i % 2 == 0 else "assistant"
        messages.append(ChatMessage(role=role, content=f"Message {i}"))
    return ChatRequest(
        mode=mode,
        persona=persona,
        messages=messages,
        portfolio=_make_portfolio(),
        asset={"ticker": "AAPL", "name": "Apple Inc."} if mode == "asset" else None,
    )


# ── Sliding window tests ────────────────────────────────────────────────────

def test_trim_messages_under_limit() -> None:
    messages = [ChatMessage(role="user", content=f"msg {i}") for i in range(4)]
    result = trim_messages(messages, max_pairs=10)
    assert len(result) == 4


def test_trim_messages_at_limit() -> None:
    messages = [
        ChatMessage(role="user" if i % 2 == 0 else "assistant", content=f"msg {i}")
        for i in range(20)
    ]
    result = trim_messages(messages, max_pairs=10)
    assert len(result) == 20


def test_trim_messages_over_limit() -> None:
    messages = [
        ChatMessage(role="user" if i % 2 == 0 else "assistant", content=f"msg {i}")
        for i in range(30)
    ]
    result = trim_messages(messages, max_pairs=10)
    assert len(result) == 20
    # Should keep the LAST 20 messages
    assert result[0].content == "msg 10"
    assert result[-1].content == "msg 29"


def test_trim_messages_empty() -> None:
    result = trim_messages([], max_pairs=10)
    assert result == []


# ── Prompt construction tests ────────────────────────────────────────────────

def test_build_prompt_beginner_common() -> None:
    prompt = build_system_prompt(
        mode="common",
        persona="beginner",
        portfolio_json='{"holdings": []}',
    )
    assert "warm" in prompt.lower() or "encouraging" in prompt.lower()
    assert "PORTFOLIO" in prompt


def test_build_prompt_experienced_asset() -> None:
    prompt = build_system_prompt(
        mode="asset",
        persona="experienced",
        portfolio_json='{"holdings": []}',
        asset_ticker="AAPL",
        asset_name="Apple Inc.",
    )
    assert "analyst" in prompt.lower() or "direct" in prompt.lower()
    assert "AAPL" in prompt
    assert "FOCUSED ASSET" in prompt


def test_build_prompt_onboarding_has_portfolio_ready_instructions() -> None:
    prompt = build_system_prompt(
        mode="onboarding",
        persona="beginner",
        portfolio_json='{"holdings": []}',
    )
    assert "PORTFOLIO_READY" in prompt


# ── AI Service streaming tests ───────────────────────────────────────────────

@pytest.fixture
def ai_service() -> AiService:
    return AiService(api_key="test-key")


async def test_stream_yields_token_events(ai_service: AiService) -> None:
    request = _make_request()

    mock_text_event = MagicMock()
    mock_text_event.type = "content_block_delta"
    mock_text_event.delta = MagicMock()
    mock_text_event.delta.type = "text_delta"
    mock_text_event.delta.text = "Hello"

    class MockStream:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        def __aiter__(self):
            return self

        async def __anext__(self):
            if not hasattr(self, "_sent"):
                self._sent = True
                return mock_text_event
            raise StopAsyncIteration

    with patch.object(ai_service.client.messages, "stream", return_value=MockStream()):
        events = []
        async for event in ai_service.stream_response(request):
            events.append(event)

    assert any("token" in e for e in events)
    assert any('"content": "Hello"' in e for e in events)
    assert any("done" in e for e in events)
