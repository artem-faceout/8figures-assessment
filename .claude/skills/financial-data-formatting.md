# Skill: Financial Data Formatting

## When to use

Whenever displaying money, percentages, or financial metrics in the UI.

## Rules

- Currency: always show 2 decimal places → `$1,234.56` (never `$1234.6`)
- Percentages: show 2 decimal places → `+2.45%` or `-1.30%`
- Always prefix positive changes with `+`
- Large numbers: use commas → `$1,234,567.89`
- Shares/quantity: no decimals for whole shares, up to 4 for fractional → `50` or `0.5432`
- Ticker symbols: always uppercase → `AAPL`, `GOOGL`

## Color coding

- Positive gain/change: `--color-gain` (#F7931A gold) with text-shadow glow `0px 0px 10px rgba(247,147,26,0.5)`
- Negative loss/change: `--color-loss` (#EF4444 red)
- Zero/neutral: `--color-text-secondary` (#888888)

## Angular pipes

Create custom pipes in `shared/pipes/`:

- `CurrencyFormatPipe` — formats number to `$X,XXX.XX`
- `PercentChangePipe` — formats to `+X.XX%` or `-X.XX%`
- `GainLossColorPipe` — returns CSS class based on positive/negative

## Alignment

- Money values: RIGHT-aligned in lists/tables
- Ticker/name: LEFT-aligned
- Use JetBrains Mono Bold (`--font-mono`) for all dollar amounts and percentages
- Use Space Grotesk Bold (`--font-heading`) for ticker symbols
- Use JetBrains Mono Regular at 10px for company names under tickers
