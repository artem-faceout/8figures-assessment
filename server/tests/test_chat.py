import json
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from main import app
from routers.chat import get_ai_service
from services.ai_service import AiService


# ── Helpers ──────────────────────────────────────────────────────────────────

def _valid_chat_body(mode: str = "common", persona: str = "beginner") -> dict:
    body = {
        "mode": mode,
        "persona": persona,
        "messages": [{"role": "user", "content": "Hello"}],
        "portfolio": {
            "holdings": [
                {
                    "ticker": "AAPL",
                    "name": "Apple Inc.",
                    "exchange": "NASDAQ",
                    "quantity": 50,
                    "cost_basis": 175.20,
                    "current_price": 198.45,
                    "value": 9922.50,
                    "daily_change_percent": 1.24,
                }
            ],
            "total_value": 9922.50,
            "daily_change": 120.00,
            "daily_change_percent": 1.22,
        },
    }
    if mode == "asset":
        body["asset"] = {"ticker": "AAPL", "name": "Apple Inc."}
    return body


def _parse_sse(text: str) -> list[dict]:
    """Parse SSE text into list of {event, data} dicts."""
    events = []
    current_event = None
    for line in text.split("\n"):
        if line.startswith("event: "):
            current_event = line[7:]
        elif line.startswith("data: "):
            data = line[6:]
            events.append({"event": current_event, "data": json.loads(data)})
            current_event = None
    return events


async def _mock_stream(*args, **kwargs):
    """Yields SSE token and done events."""
    yield "event: token\ndata: {\"content\": \"Hello\"}\n\n"
    yield "event: token\ndata: {\"content\": \" world\"}\n\n"
    yield "event: done\ndata: {}\n\n"


def _mock_ai_service() -> AiService:
    service = AsyncMock(spec=AiService)
    service.stream_response = _mock_stream
    return service


DEVICE_HEADERS = {"X-Device-ID": "test-device-chat"}


@pytest.fixture(autouse=True)
def override_ai_service():
    """Override AI service dependency for all tests by default."""
    app.dependency_overrides[get_ai_service] = _mock_ai_service
    yield
    app.dependency_overrides.clear()


# ── Validation tests ────────────────────────────────────────────────────────

async def test_chat_rejects_invalid_mode(client: AsyncClient) -> None:
    body = _valid_chat_body()
    body["mode"] = "invalid"
    response = await client.post("/api/v1/chat", json=body, headers=DEVICE_HEADERS)
    assert response.status_code == 422


async def test_chat_rejects_missing_messages(client: AsyncClient) -> None:
    body = _valid_chat_body()
    del body["messages"]
    response = await client.post("/api/v1/chat", json=body, headers=DEVICE_HEADERS)
    assert response.status_code == 422


async def test_chat_rejects_asset_mode_without_asset(client: AsyncClient) -> None:
    body = _valid_chat_body(mode="asset")
    del body["asset"]
    response = await client.post("/api/v1/chat", json=body, headers=DEVICE_HEADERS)
    assert response.status_code == 422


async def test_chat_rejects_empty_message_content(client: AsyncClient) -> None:
    body = _valid_chat_body()
    body["messages"] = [{"role": "user", "content": ""}]
    response = await client.post("/api/v1/chat", json=body, headers=DEVICE_HEADERS)
    assert response.status_code == 422


async def test_chat_missing_device_id_returns_400(client: AsyncClient) -> None:
    response = await client.post("/api/v1/chat", json=_valid_chat_body())
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "MISSING_DEVICE_ID"


# ── SSE streaming tests ─────────────────────────────────────────────────────

async def test_chat_returns_sse_content_type(client: AsyncClient) -> None:
    response = await client.post("/api/v1/chat", json=_valid_chat_body(), headers=DEVICE_HEADERS)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]


async def test_chat_streams_token_events(client: AsyncClient) -> None:
    response = await client.post("/api/v1/chat", json=_valid_chat_body(), headers=DEVICE_HEADERS)
    events = _parse_sse(response.text)
    token_events = [e for e in events if e["event"] == "token"]
    assert len(token_events) == 2
    assert token_events[0]["data"]["content"] == "Hello"
    assert token_events[1]["data"]["content"] == " world"


async def test_chat_streams_done_event(client: AsyncClient) -> None:
    response = await client.post("/api/v1/chat", json=_valid_chat_body(), headers=DEVICE_HEADERS)
    events = _parse_sse(response.text)
    done_events = [e for e in events if e["event"] == "done"]
    assert len(done_events) == 1


# ── Mode routing tests ──────────────────────────────────────────────────────

async def test_chat_accepts_all_modes(client: AsyncClient) -> None:
    for mode in ["onboarding", "common", "asset"]:
        response = await client.post("/api/v1/chat", json=_valid_chat_body(mode=mode), headers=DEVICE_HEADERS)
        assert response.status_code == 200, f"Failed for mode={mode}"


async def test_chat_accepts_both_personas(client: AsyncClient) -> None:
    for persona in ["beginner", "experienced"]:
        response = await client.post(
            "/api/v1/chat", json=_valid_chat_body(persona=persona), headers=DEVICE_HEADERS
        )
        assert response.status_code == 200, f"Failed for persona={persona}"


# ── Error handling tests ─────────────────────────────────────────────────────

async def test_chat_missing_api_key_returns_error(client: AsyncClient) -> None:
    def _failing_service():
        raise ValueError("ANTHROPIC_API_KEY not configured")

    app.dependency_overrides[get_ai_service] = _failing_service
    response = await client.post("/api/v1/chat", json=_valid_chat_body(), headers=DEVICE_HEADERS)
    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == "AI_SERVICE_ERROR"
