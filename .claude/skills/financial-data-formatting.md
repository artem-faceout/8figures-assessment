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

- Positive gain/change: `--ion-color-success` (#2DD36F)
- Negative loss/change: `--ion-color-danger` (#EB445A)
- Zero/neutral: default text color

## Angular pipes

Create custom pipes in `shared/pipes/`:

- `CurrencyFormatPipe` — formats number to `$X,XXX.XX`
- `PercentChangePipe` — formats to `+X.XX%` or `-X.XX%`
- `GainLossColorPipe` — returns CSS class based on positive/negative

## Alignment

- Money values: RIGHT-aligned in lists/tables
- Ticker/name: LEFT-aligned
- Use monospace font for numbers where they appear in columns (alignment matters)
