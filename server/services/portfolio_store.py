"""In-memory portfolio store keyed by anonymous device ID."""

from models.portfolio import Portfolio

_store: dict[str, Portfolio] = {}


def save_portfolio(device_id: str, portfolio: Portfolio) -> None:
    _store[device_id] = portfolio


def get_portfolio(device_id: str) -> Portfolio | None:
    return _store.get(device_id)
