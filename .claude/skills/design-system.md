# Skill: Design System

## When to use
When building any UI component. This is the single source of truth for visual decisions.

## Color Tokens

### Brand
- `--color-primary`: #3880FF (Ionic primary blue)
- `--color-primary-shade`: #3171E0
- `--color-primary-tint`: #4C8DFF

### Semantic
- `--color-gain`: #2DD36F (positive/profit — Ionic success)
- `--color-loss`: #EB445A (negative/loss — Ionic danger)
- `--color-neutral`: #92949C (unchanged/zero — Ionic medium)
- `--color-warning`: #FFC409 (alerts — Ionic warning)

### Surface
- `--color-background`: #F4F5F8 (light mode page background)
- `--color-surface`: #FFFFFF (card/sheet background)
- `--color-surface-shade`: #F4F5F8 (subtle card distinction)

### Text
- `--color-text-primary`: #1A1A2E (headings, primary content)
- `--color-text-secondary`: #92949C (labels, secondary info)
- `--color-text-inverse`: #FFFFFF (text on dark/colored backgrounds)

## Typography

### Font Stack
- Primary: system font stack (Ionic default — SF Pro on iOS, Roboto on Android)
- Monospace (financial numbers): `'SF Mono', 'Roboto Mono', 'Courier New', monospace`

### Scale
| Token | Size | Weight | Use |
|-------|------|--------|-----|
| heading-xl | 28px / 1.75rem | 700 | Portfolio total value |
| heading-lg | 22px / 1.375rem | 600 | Screen titles |
| heading-md | 18px / 1.125rem | 600 | Section headers, card titles |
| body-lg | 16px / 1rem | 400 | Primary content, chat messages |
| body-md | 14px / 0.875rem | 400 | Secondary content, labels |
| body-sm | 12px / 0.75rem | 400 | Captions, timestamps |
| number-lg | 22px / 1.375rem | 600 mono | Portfolio total, large values |
| number-md | 16px / 1rem | 500 mono | Holding values, prices |
| number-sm | 14px / 0.875rem | 400 mono | Percentages, small metrics |

## Spacing Scale
Use Ionic CSS utilities (`ion-padding`, `ion-margin`) as default. For custom spacing:
- 4px (xs), 8px (sm), 12px (md), 16px (lg), 24px (xl), 32px (2xl)
- Always use rem, never px: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem

## Border Radius
- Cards: 12px (0.75rem)
- Buttons: 8px (0.5rem)
- Chips/badges: 16px (1rem)
- Full round (avatars): 50%

## Shadows
- Card: `0 2px 8px rgba(0, 0, 0, 0.08)` — subtle, don't overdo
- No other shadows needed for mid-fidelity

## Ionic Variable Overrides
Set these in `src/theme/variables.scss` (create if missing):
```scss
:root {
  --ion-color-primary: #3880FF;
  --ion-color-success: #2DD36F;
  --ion-color-danger: #EB445A;
  --ion-color-warning: #FFC409;
  --ion-color-medium: #92949C;
  --ion-background-color: #F4F5F8;
  --ion-card-background: #FFFFFF;
  --ion-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## Component Patterns

### Financial Value Display
- Dollar amounts: right-aligned, monospace, 2 decimal places
- Positive change: green text, prefixed with `+`
- Negative change: red text, minus is inherent
- Zero change: neutral/medium text color

### Cards
- Always `ion-card` with 12px radius
- Content padding via `ion-card-content` (don't add custom padding)
- Header info (ticker, name) left-aligned
- Value info (price, change) right-aligned

### Lists
- Use `ion-list` with `ion-item` — never custom `<ul>/<li>`
- Dividers between items via `lines="inset"` on `ion-list`

### Touch Targets
- Minimum 44x44pt for all interactive elements
- Ionic buttons/items handle this by default — don't shrink them
