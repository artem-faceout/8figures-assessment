from models.portfolio import AssetMetrics

MOCK_METRICS: dict[str, AssetMetrics] = {
    "AAPL": AssetMetrics(
        ticker="AAPL",
        pe_ratio=32.1,
        market_cap="$3.04T",
        day_range_low=195.20,
        day_range_high=199.10,
        volume="45.2M",
    ),
    "MSFT": AssetMetrics(
        ticker="MSFT",
        pe_ratio=35.8,
        market_cap="$3.12T",
        day_range_low=412.50,
        day_range_high=417.30,
        volume="22.1M",
    ),
    "VOO": AssetMetrics(
        ticker="VOO",
        pe_ratio=None,
        market_cap="$412.8B",
        day_range_low=446.10,
        day_range_high=450.20,
        volume="3.8M",
    ),
    "NVDA": AssetMetrics(
        ticker="NVDA",
        pe_ratio=62.4,
        market_cap="$1.79T",
        day_range_low=718.60,
        day_range_high=730.50,
        volume="38.7M",
    ),
    "BTC": AssetMetrics(
        ticker="BTC",
        pe_ratio=None,
        market_cap="$1.34T",
        day_range_low=67200.00,
        day_range_high=69100.00,
        volume="$28.4B",
    ),
}
