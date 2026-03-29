from models.portfolio import Holding, Portfolio

MOCK_HOLDINGS: list[Holding] = [
    Holding(
        ticker="AAPL",
        name="Apple Inc.",
        exchange="NASDAQ",
        quantity=50,
        cost_basis=175.20,
        current_price=198.45,
        value=9922.50,
        daily_change_percent=1.24,
    ),
    Holding(
        ticker="MSFT",
        name="Microsoft Corporation",
        exchange="NASDAQ",
        quantity=30,
        cost_basis=380.50,
        current_price=415.80,
        value=12474.00,
        daily_change_percent=0.89,
    ),
    Holding(
        ticker="VOO",
        name="Vanguard S&P 500 ETF",
        exchange="NYSEARCA",
        quantity=25,
        cost_basis=420.00,
        current_price=448.60,
        value=11215.00,
        daily_change_percent=0.45,
    ),
    Holding(
        ticker="NVDA",
        name="NVIDIA Corporation",
        exchange="NASDAQ",
        quantity=15,
        cost_basis=650.00,
        current_price=725.30,
        value=10879.50,
        daily_change_percent=-0.32,
    ),
    Holding(
        ticker="BTC",
        name="Bitcoin",
        exchange="CRYPTO",
        quantity=0.04,
        cost_basis=62000.00,
        current_price=68475.00,
        value=2739.00,
        daily_change_percent=2.15,
    ),
]

MOCK_PORTFOLIO = Portfolio(
    holdings=MOCK_HOLDINGS,
    total_value=47230.00,
    daily_change=312.50,
    daily_change_percent=0.67,
)
