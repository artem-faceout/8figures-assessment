import pytest

from models.portfolio import Holding, Portfolio
from services.portfolio_store import get_portfolio, save_portfolio, _store


@pytest.fixture(autouse=True)
def clear_store():
    _store.clear()
    yield
    _store.clear()


def _make_portfolio(total_value: float = 9922.50) -> Portfolio:
    return Portfolio(
        holdings=[
            Holding(
                ticker="AAPL", name="Apple Inc.", exchange="NASDAQ",
                quantity=50, cost_basis=175.20, current_price=198.45,
                value=9922.50, daily_change_percent=1.24,
            ),
        ],
        total_value=total_value,
        daily_change=120.00,
        daily_change_percent=1.22,
    )


def test_get_unknown_device_returns_none() -> None:
    assert get_portfolio("unknown-device") is None


def test_save_and_retrieve() -> None:
    portfolio = _make_portfolio()
    save_portfolio("device-1", portfolio)
    result = get_portfolio("device-1")
    assert result is not None
    assert result.total_value == 9922.50
    assert len(result.holdings) == 1
    assert result.holdings[0].ticker == "AAPL"


def test_overwrite_existing_portfolio() -> None:
    save_portfolio("device-1", _make_portfolio(total_value=1000.00))
    save_portfolio("device-1", _make_portfolio(total_value=2000.00))
    result = get_portfolio("device-1")
    assert result is not None
    assert result.total_value == 2000.00


def test_separate_devices_are_isolated() -> None:
    save_portfolio("device-1", _make_portfolio(total_value=1000.00))
    save_portfolio("device-2", _make_portfolio(total_value=2000.00))
    assert get_portfolio("device-1").total_value == 1000.00
    assert get_portfolio("device-2").total_value == 2000.00
