import hashlib
import random
from datetime import datetime, timedelta, timezone

from models.history import PriceHistory, PricePoint, TimeRange

POINTS_PER_RANGE: dict[TimeRange, int] = {
    TimeRange.ONE_WEEK: 7,
    TimeRange.ONE_MONTH: 30,
    TimeRange.THREE_MONTHS: 90,
    TimeRange.ONE_YEAR: 252,
    TimeRange.ALL: 500,
}

VOLATILITY: dict[str, float] = {
    "BTC": 0.03,
    "VOO": 0.005,
}
DEFAULT_VOLATILITY = 0.012


def _ticker_seed(ticker: str) -> int:
    return int(hashlib.md5(ticker.encode()).hexdigest(), 16) % (2**32)


def generate_price_history(
    ticker: str, current_price: float, time_range: TimeRange
) -> PriceHistory:
    num_points = POINTS_PER_RANGE[time_range]
    volatility = VOLATILITY.get(ticker.upper(), DEFAULT_VOLATILITY)
    rng = random.Random(_ticker_seed(ticker) + hash(time_range))

    now = datetime.now(timezone.utc).replace(hour=16, minute=0, second=0, microsecond=0)
    prices: list[float] = [current_price]

    for _ in range(num_points - 1):
        change = rng.gauss(0, volatility)
        prev = prices[-1]
        new_price = prev * (1 - change)
        prices.append(max(new_price, current_price * 0.01))

    prices.reverse()

    points = [
        PricePoint(
            timestamp=now - timedelta(days=num_points - 1 - i),
            price=round(price, 2),
        )
        for i, price in enumerate(prices)
    ]

    return PriceHistory(ticker=ticker, range=time_range, points=points)
