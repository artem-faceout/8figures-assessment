# Skill: Design System

## When to use
When building any UI component. This is the single source of truth for visual decisions. Extracted from Figma designs.

## Theme: Dark Mode

This is a dark-themed luxury fintech app. All surfaces are near-black. Gold (#F7931A) is the accent color throughout.

## Color Tokens

### Accent / Brand
- `--color-accent`: #F7931A (gold/orange — the primary brand color)
- `--color-accent-muted`: rgba(247, 147, 26, 0.8) (for secondary accent text)
- `--color-accent-subtle`: rgba(247, 147, 26, 0.2) (for borders, hints)
- `--color-accent-glow`: rgba(247, 147, 26, 0.5) (for text-shadow and box-shadow glows)
- `--color-accent-bg`: rgba(247, 147, 26, 0.05) (for subtle accent backgrounds)
- `--color-accent-bg-strong`: rgba(247, 147, 26, 0.1) (for avatar/badge backgrounds)

### Semantic
- `--color-gain`: #F7931A (positive/profit — gold, NOT green)
- `--color-loss`: #EF4444 (negative/loss — red)
- `--color-warning`: #E9C400 (yellow — used for "System Online" indicator, volatility)
- `--color-neutral`: #888888 (unchanged/zero)

### Surface
- `--color-background`: #030304 (app background — near black)
- `--color-background-alt`: #050505 (alternative dark background)
- `--color-background-onboarding`: #08090C (onboarding bridge screen)
- `--color-surface`: #0A0A0A (card backgrounds)
- `--color-surface-elevated`: #131315 (bottom navigation, input shell)
- `--color-surface-card-alt`: #0F1115 (onboarding selection cards)
- `--color-surface-overlay`: rgba(255, 255, 255, 0.05) (subtle overlays, avatar backgrounds)
- `--color-surface-overlay-10`: rgba(255, 255, 255, 0.1) (avatar backgrounds in onboarding, inactive indicators)
- `--color-surface-frosted`: rgba(32, 31, 33, 0.6) (frosted glass cards — paywall pricing)
- `--color-border`: #1F1F1F (card borders, dividers)
- `--color-border-alt`: #2D2F36 (onboarding card borders, cooler tone)
- `--color-border-accent`: rgba(247, 147, 26, 0.2) (accent borders on AI insight cards)
- `--color-border-accent-strong`: rgba(247, 147, 26, 0.4) (paywall card top border)
- `--color-border-subtle`: rgba(255, 255, 255, 0.05) (metric card borders)
- `--color-border-white-10`: rgba(255, 255, 255, 0.1) (AI response bubble border)

### Text
- `--color-text-primary`: #F2F2F2 (headings, primary content)
- `--color-text-white`: #FFFFFF (onboarding headings, pure white)
- `--color-text-secondary`: #888888 (labels, secondary info, muted text)
- `--color-text-muted`: #A1A1AA (metric labels, timestamps)
- `--color-text-description`: #A0A0A0 (onboarding descriptions — JetBrains Mono)
- `--color-text-warm`: #DBC2AE (warm toned labels, paywall body text)
- `--color-text-warm-chat`: #A38D7B (chat timestamps, metric labels in chat)
- `--color-text-white-half`: rgba(255, 255, 255, 0.5) (onboarding body text, AI quotes)
- `--color-text-white-40`: rgba(255, 255, 255, 0.4) (mini portfolio detail labels)
- `--color-text-white-90`: rgba(255, 255, 255, 0.9) (user message in onboarding chat)
- `--color-text-accent`: #F7931A (accent text, links, active items)
- `--color-text-accent-highlight`: #FFB874 (highlighted tokens — BTC, NVDA mentions, paywall label)
- `--color-text-on-accent`: #603500 (dark text on gold backgrounds — user chat bubbles)
- `--color-text-on-accent-button`: #000000 (black text on solid gold buttons)
- `--color-text-on-gradient-button`: #2D1600 (very dark brown text on gradient buttons)
- `--color-text-chat-body`: #E5E1E4 (AI chat message text)
- `--color-text-feature-list`: #E5E1E4 (paywall feature list items)
- `--color-green`: #4ADE80 (green — used ONLY in onboarding AI preview for gain percentages, not in main app)

### Gradients
- `--gradient-accent`: linear-gradient(135deg, #F7931A, #FFAB4A) — CTA buttons, gradient text
- `--gradient-accent-text`: linear-gradient(135deg, #F7931A, #FFAB4A) — applied via background-clip: text
- `--gradient-hero-text`: linear-gradient(to right, #F7931A, #EA580C 50%, #FFB874) — paywall hero title
- `--gradient-cta-strong`: linear-gradient(to right, #EA580C, #F7931A) — paywall CTA button with orange-red
- `--gradient-surface`: linear-gradient(145deg, #0F0F0F, #050505) — metric bento cards
- `--gradient-divider`: linear-gradient(to right, rgba(247,147,26,0), rgba(247,147,26,0.3)) — splash footer dividers

## Typography

### Font Stack
- **Headings:** `'Space Grotesk', sans-serif` (Bold, various sizes)
- **Monospace / Numbers:** `'JetBrains Mono', monospace` (Regular for labels, Bold for values)
- **Body:** `'Inter', sans-serif` (Regular/Medium for paragraph text)

### Scale (extracted from Figma)
| Token | Font | Size | Weight | Tracking | Use |
|-------|------|------|--------|----------|-----|
| hero-price | Space Grotesk | 60px | Bold | -3px | Asset detail hero price |
| portfolio-value | JetBrains Mono | 48px | Bold | -2.4px | Portfolio total value |
| heading-lg | Space Grotesk | 20px | Bold | 2px | Section headers ("HOLDINGS") |
| heading-md | Space Grotesk | 18px | Bold | -0.45px | Asset name in header, metric values |
| heading-sm | Space Grotesk | 16px | Bold | -0.4px | Ticker symbols, holding values |
| heading-xs | Space Grotesk | 14px | Bold | - | Chat title, buttons |
| body-md | Inter | 14px | Regular/Medium | - | Chat messages, descriptions |
| body-sm | Inter | 12px | Medium | 1.2px | Timestamps, close info |
| label-lg | Space Grotesk | 12px | Bold | 0.6px | AI insight titles (uppercase) |
| label-md | Inter | 10px | Bold | 1px | Metric labels (uppercase, tracking) |
| label-sm | JetBrains Mono | 10px | Regular | 2px | Status bar text, timestamps |
| mono-value-lg | JetBrains Mono | 16px | Bold | - | Holding dollar values |
| mono-value-sm | JetBrains Mono | 10px | Bold | - | Percentage changes |
| mono-label | JetBrains Mono | 10px | Regular | -0.5px | Metric sub-labels |
| chip-text | JetBrains Mono | 11px | Regular | - | Context suggestion chips |
| onboarding-heading | Space Grotesk | 36px | Bold | -0.9px | Onboarding main headings |
| onboarding-body | Inter | 18px | Regular | - | Onboarding description text (white 50%) |
| onboarding-subtitle | JetBrains Mono | 16px | Regular | - | Onboarding subtitles (#A0A0A0) |
| card-title | Space Grotesk | 20px | Bold | - | Onboarding selection card titles |
| card-description | JetBrains Mono | 14px | Regular | - | Card descriptions (#A0A0A0) |
| paywall-hero | Space Grotesk | 48px | Bold | -1.2px | Paywall hero (gradient text) |
| paywall-price | Space Grotesk | 48px | Bold | - | Pricing value |
| paywall-body | Inter | 18px | Light | - | Paywall description (#DBC2AE) |
| paywall-feature | Inter | 16px | Medium | - | Feature list items (#E5E1E4) |
| paywall-label | Inter | 14px | Medium | 1.4px | "Premium Yearly" label (uppercase, #FFB874) |
| cta-button | Space Grotesk | 18px | Bold | -0.45px | Primary CTA text |
| ai-label | Space Grotesk | 14px | Bold | 1.4px | "8FIGURES AI" label (uppercase, accent) |
| insight-chip | Inter | 11px | Bold | 1.1px | "Smart Insight" chip (uppercase, accent) |
| fine-print | Inter | 10px | Regular | 2px | Legal/fine print (white 40%, uppercase) |

### Key Typography Rules
- **ALL labels are uppercase** with letter-spacing (tracking)
- Headings use **Space Grotesk Bold**
- Financial numbers use **JetBrains Mono Bold**
- Labels/captions use **JetBrains Mono Regular** or **Inter Bold** at 10px, uppercase, tracked
- Body text uses **Inter Regular** at 14px
- **Gradient text** on key words: apply `background-clip: text` + `--gradient-accent-text` + `color: transparent`
- Onboarding body text: **Inter Regular 18px at 50% white opacity** — NOT the same as dashboard body

## Spacing Scale
- 4px, 6px, 7px, 8px, 12px, 16px, 21px, 24px, 25px, 32px, 33px, 48px
- Cards use generous internal padding: 25px or 33px
- Section gaps: 24px or 32px
- Holdings list gap: 12px between items

## Border Radius
- **Cards (portfolio, metrics, position):** 32px (very rounded)
- **Holdings row items:** 9999px (full pill shape)
- **Buttons / nav capsule:** 9999px (full pill)
- **Avatar circles:** 9999px (full circle)
- **Chat bubbles (user):** 48px top-left, 48px top-right, 48px bottom-left (rounded except bottom-right)
- **Chat bubbles (AI):** 48px top-left, 48px top-right, 48px bottom-right (rounded except bottom-left)
- **Bento metric cards in chat:** 6px
- **Logo icon:** 32px

## Shadows & Glows
- **Accent glow on text:** `text-shadow: 0px 0px 10px rgba(247, 147, 26, 0.5)`
- **Accent glow on elements:** `box-shadow: 0px 0px 20px rgba(247, 147, 26, 0.3)`
- **Strong accent glow (buttons):** `box-shadow: 0px 0px 30px rgba(247, 147, 26, 0.3)`
- **Navigation capsule shadow:** `box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.8)`
- **Card ambient glow:** 128px accent-colored blur in card corner (e.g. portfolio summary top-right)
- **No heavy drop shadows on cards** — borders provide structure, glows provide depth

## Component Patterns

### Portfolio Summary Card
- Background: #000000 (pure black)
- Border: 1px solid #1F1F1F
- Radius: 32px
- Padding: 57px top, 33px sides, 33px bottom
- Corner accent glow: 128px circle, accent-bg at 5% opacity, 40px blur
- Contains: label (uppercase), total value (48px mono bold), percentage (accent), daily change, sparkline bar chart

### Holding Row
- Background: #0A0A0A
- Border: 1px solid #1F1F1F
- Radius: 9999px (pill)
- Padding: 21px all sides
- Layout: avatar (48px circle) | ticker + name | value + percentage (right-aligned)
- Avatar: circular with surface-overlay bg + border, first letter of ticker
- BTC avatar letter is gold (#F7931A), others are white

### AI Insight Card
- Background: #0A0A0A
- Border: 1px solid accent-subtle (rgba(247,147,26,0.2))
- Radius: 32px
- Gold circle avatar (40px) with icon
- Title in accent color, uppercase, tracked, with text glow
- Chevron ">" on the right for navigation

### Metric Bento Cards
- Background: gradient from #0F0F0F to #050505
- Border: 1px solid rgba(255,255,255,0.05)
- Radius: 32px
- Layout: 2-column grid, 16px gap
- Label: 10px uppercase tracked, muted color
- Value: 24px Space Grotesk Bold, white

### Chat Bubbles
- **User message:** Gold background (#F7931A), dark text (#603500), rounded pill (48px radius, flat bottom-right)
- **AI message:** Dark background (#1C1B1D), light text (#E5E1E4), accent border, rounded pill (48px radius, flat bottom-left)
- AI avatar: 40px circle with image
- Timestamps: 10px JetBrains Mono, warm muted color (#A38D7B)
- Data cards below AI message: 2-column grid, 6px radius, dark overlay bg

### Floating Navigation
- Backdrop blur 20px
- Pill shape (9999px radius)
- Heavy shadow (40px black)
- Primary action button: gold circle with icon + glow

### Bottom Input Bar (Chat)
- Background: #131315 (slightly elevated)
- Top border: accent-subtle
- Input field: #0E0E10 bg, accent border at 30% opacity, pill shape
- Send button: gold circle
- Context suggestion chips: pill shape, dark overlay bg, accent border

### Header / Top App Bar
- Backdrop blur 12px
- Background: rgba(3,3,4,0.6) (semi-transparent for blur effect)
- Bottom border: accent-subtle
- Title: accent color, Space Grotesk Bold

### Onboarding Screens (Splash, Hook, Promise, Bridge)
- Full-screen dark backgrounds with large ambient glows (320-500px blurred circles)
- Glow colors: gold at 10-20% opacity, mix-blend-mode: screen
- Heading: 36px Space Grotesk Bold, white, with gradient-text on key words
- Body: 18px Inter Regular, white at 50% opacity, centered
- CTA button: full-width pill, gradient gold (135deg, #F7931A → #FFAB4A), shadow glow
- Button text: 18px Space Grotesk Bold, black
- Page indicators: 3 dots, active = gold pill (32w × 6h), inactive = white 10% circle (6×6)
- Page indicator gap: 10-12px

### Onboarding Selection Cards (Bridge)
- Background: #0F1115
- Border: 1px solid #2D2F36
- Radius: 40px
- Padding: 33px
- Layout: icon (56px circle) + title (20px Space Grotesk Bold) + description (14px JetBrains Mono, #A0A0A0)
- Decorative element in bottom-right corner (overflows the card)
- Gap between cards: 24px

### Onboarding Chat Preview (Promise)
- User bubble: semi-transparent gold bg (rgba(247,147,26,0.1)), gold border, backdrop blur
  - Radius: 40px all corners EXCEPT top-right = 6px
  - Text: 16px Inter Medium, white at 90%
- AI response bubble: very subtle white bg (rgba(255,255,255,0.03)), white border at 10%, backdrop blur
  - Radius: 40px all corners EXCEPT top-left = 6px
  - AI avatar: 32px gold circle with sparkle icon
  - Inline mini-portfolio cards inside bubble
  - AI insight chip: pill, gold bg 20%, gold border 30%, "Smart Insight" label

### AI Insight Chip (appears in Bridge + Promise screens)
- Pill shape (9999px radius)
- Background: rgba(247, 147, 26, 0.2)
- Border: 1px solid rgba(247, 147, 26, 0.3)
- Content: sparkle icon + uppercase label
- Text: 11px Inter Bold, accent color, 1.1px tracking

### Paywall / Pricing Card
- Frosted glass: backdrop-blur 10px, bg rgba(32,31,33,0.6)
- Border: 2px top (accent at 40%), 1px sides/bottom (accent at 40%)
- Radius: 32px
- Padding: 33px
- Label: "PREMIUM YEARLY" — 14px Inter Medium, #FFB874, uppercase, 1.4px tracking
- Price: 48px Space Grotesk Bold, #E5E1E4
- Feature list: icon + 16px Inter Medium #E5E1E4, 24px gap between items
- Hero heading: 48px Space Grotesk Bold, 3-stop gradient text
- CTA: gradient button (EA580C → F7931A), pill, strong shadow glow
- Fine print: 10px Inter Regular, white at 40%, uppercase, 2px tracking

### Background Ambient Glows
Used across splash, onboarding, paywall for depth:
- Large circles (320-500px)
- Gold (#F7931A) at 5-20% opacity
- Blur: 32-75px
- mix-blend-mode: screen (on some)
- Positioned at edges, partially offscreen
- Some grey (#333) glows with mix-blend-mode: overlay for contrast

## Ionic Variable Overrides
Set these in `src/theme/variables.scss`:
```scss
:root {
  // Core
  --ion-background-color: #030304;
  --ion-card-background: #0a0a0a;
  --ion-item-background: #0a0a0a;
  --ion-toolbar-background: rgba(3, 3, 4, 0.6);
  --ion-tab-bar-background: #131315;

  // Text
  --ion-text-color: #f2f2f2;
  --ion-text-color-step-400: #888888;
  --ion-text-color-step-600: #a1a1aa;

  // Accent (mapped to Ionic primary)
  --ion-color-primary: #f7931a;
  --ion-color-primary-shade: #d97e16;
  --ion-color-primary-tint: #f89e31;
  --ion-color-primary-contrast: #000000;

  // Semantic
  --ion-color-success: #f7931a;  // Gain = gold in this design
  --ion-color-danger: #ef4444;
  --ion-color-warning: #e9c400;
  --ion-color-medium: #888888;

  // Fonts
  --ion-font-family: 'Inter', sans-serif;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  // Borders
  --ion-border-color: #1f1f1f;
}
```

## Font Loading
Google Fonts must be loaded in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```
