# Skill: Figma to Ionic/Angular Translation

## When to use
When implementing a screen or component from a Figma design using the Figma MCP.

## The Translation Pipeline

```
Figma MCP (get_design_context)
  → React + Tailwind code + screenshot
    → Identify structure and visual patterns
      → Map to Ionic (structure) + custom SCSS (visuals)
        → Angular component with design system tokens
```

## Step 1: Get the design from Figma

Call `get_design_context` with the node ID and file key. You get:
- **Screenshot** — the visual truth, use this to verify your implementation
- **React + Tailwind code** — reference for structure, colors, fonts, spacing. NOT final code.
- **Asset URLs** — images/icons (expire in 7 days, download and save locally)

## Step 2: Read the output, extract patterns

From the React+Tailwind code, extract:
- **Layout structure**: what contains what, flex direction, gaps
- **Colors**: hex values and rgba — map to `design-system.md` tokens
- **Typography**: font-family, size, weight, tracking — map to DS typography scale
- **Spacing**: padding, margin, gap values — map to DS spacing scale
- **Radius**: border-radius values
- **Effects**: shadows, blurs, gradients, opacity

**Do NOT copy the React/Tailwind code.** It's a reference, not a template.

## Step 3: Map structure to Ionic + custom

### The rule: Ionic for STRUCTURE, custom SCSS for VISUALS

**Use Ionic components for:**
- Page layout (`ion-header`, `ion-content`, `ion-footer`)
- Navigation (`ion-tabs`, `ion-tab-bar`, `ion-back-button`)
- Lists (`ion-list`, `ion-item`)
- Buttons (`ion-button`)
- Inputs (`ion-input`, `ion-textarea`)
- Modals (`ion-modal`)
- Scrolling, safe areas, keyboard avoidance

**Use custom SCSS/HTML for:**
- Gradient backgrounds and ambient glows
- Frosted glass effects (backdrop-filter: blur)
- Gradient text (background-clip: text)
- Custom card designs (32px radius, specific padding)
- Chat bubbles (asymmetric radius)
- Sparkline/bar charts
- Pill-shaped elements with specific styling
- Bento grid layouts
- Decorative elements (grain textures, refraction lines)

### Component mapping for THIS project

| Figma element | Implementation |
|---|---|
| **Top app bar** (chat, asset detail) | `ion-header` + `ion-toolbar` with custom backdrop-blur SCSS |
| **Scrollable content** | `ion-content` |
| **Bottom input bar** (chat) | `ion-footer` + `ion-toolbar` with custom SCSS |
| **Bottom tab navigation** | `ion-tabs` + `ion-tab-bar` (if used) |
| **Floating navigation capsule** (dashboard) | Custom component with `position: absolute`, backdrop-blur, pill shape — NOT `ion-fab` (wrong shape) |
| **Portfolio summary card** | Custom component: div with 32px radius, #000 bg, border #1F1F1F, corner glow |
| **Holding row** (AAPL, MSFT etc.) | `ion-item` with custom SCSS for pill shape (9999px radius), or custom component if ion-item styling is too constrained |
| **AI insight card** | Custom component: div with accent border, gold avatar, chevron |
| **Metric bento grid** (asset detail) | CSS Grid (2 columns) — `ion-grid` doesn't support the gradient card backgrounds well |
| **Position card** (asset detail) | Custom component with 2-column grid layout inside |
| **Chat user bubble** | Custom component: gold bg, specific radius (48px except bottom-right) |
| **Chat AI bubble** | Custom component: dark bg, accent border, specific radius (48px except bottom-left) |
| **Chat data cards** (risk, volatility) | CSS Grid inside AI bubble |
| **Context suggestion chips** | `ion-chip` with custom SCSS, or custom pill spans |
| **Time range tabs** (1W, 1M, 3M) | `ion-segment` + `ion-segment-button` with custom gold active styling |
| **Page indicators** (onboarding) | Custom component: flex row of dots/pills |
| **Onboarding CTA button** | `ion-button` with `expand="block"` + custom gradient SCSS |
| **Selection cards** (onboarding bridge) | Custom component: div with 40px radius, specific layout |
| **Paywall pricing card** | Custom component: frosted glass, gradient border |
| **Sparkline bar chart** | Custom component or lightweight chart library |
| **Price chart** (asset detail) | Chart library (e.g., lightweight-charts) or SVG |

### When to use ion-item vs custom div

**Use `ion-item`** when:
- Standard list row with label + value
- You need Ionic's built-in click handling, ripple, lines
- Slot-based layout (start/end) works for your design

**Use custom component** when:
- Non-standard radius (pill shape, 32px cards)
- Complex internal layout (nested grids, multiple text blocks)
- Custom backgrounds (gradients, glass effects, glows)
- Asymmetric borders or radius (chat bubbles)

In this project, most visible elements are custom because the design is highly styled. Ionic provides the structural shell; CSS does the visual work.

## Step 4: Convert to Angular + SCSS

### From Tailwind classes → SCSS with DS tokens

| Tailwind in Figma output | SCSS equivalent |
|---|---|
| `bg-[#f7931a]` | `background: var(--color-accent)` |
| `text-[#f2f2f2]` | `color: var(--color-text-primary)` |
| `text-[#888]` | `color: var(--color-text-secondary)` |
| `font-['Space_Grotesk:Bold']` | `font-family: var(--font-heading); font-weight: 700` |
| `font-['JetBrains_Mono:Bold']` | `font-family: var(--font-mono); font-weight: 700` |
| `font-['Inter:Regular']` | `font-family: var(--ion-font-family); font-weight: 400` |
| `rounded-[32px]` | `border-radius: 2rem` |
| `rounded-[9999px]` | `border-radius: 9999px` |
| `backdrop-blur-[12px]` | `backdrop-filter: blur(12px)` |
| `shadow-[0px_0px_20px_...]` | `box-shadow: 0 0 20px ...` |
| `gap-[24px]` | `gap: 1.5rem` |
| `p-[33px]` | `padding: 2.0625rem` |
| `tracking-[2px]` | `letter-spacing: 2px` |
| `uppercase` | `text-transform: uppercase` |
| `bg-clip-text text-[transparent]` + gradient | `background-clip: text; -webkit-background-clip: text; color: transparent; background-image: var(--gradient-accent-text)` |

### From React JSX → Angular template

| React pattern | Angular equivalent |
|---|---|
| `className="..."` | `class="..."` |
| `{condition && <Comp/>}` | `@if (condition) { <comp/> }` |
| `{items.map(i => ...)}` | `@for (item of items; track item.id) { ... }` |
| `style={{ backgroundImage: "..." }}` | `[style.background-image]="..."` or SCSS class |
| `<img src={imgVar} />` | `<img [src]="imgVar" />` |
| `onClick={handler}` | `(click)="handler()"` |

## Step 5: Apply design system tokens

NEVER hardcode hex values from the Figma output. Always map to `design-system.md`:

```scss
// BAD — hardcoded from Figma
.card { background: #0a0a0a; border: 1px solid #1f1f1f; }

// GOOD — uses design tokens
.card { background: var(--color-surface); border: 1px solid var(--color-border); }
```

If a value from Figma doesn't exist in the design system, check if it's close to an existing token (Figma rounding). If it's genuinely new, add it to `design-system.md` first, then use it.

## Step 6: Handle what Figma can't show

Add these behaviors not visible in static mockups:
- **Loading states:** `ion-skeleton-text` shimmer for every data-dependent element
- **Empty states:** meaningful message when no data
- **Error states:** `ion-toast` or inline error for API failures
- **Pull-to-refresh:** `ion-refresher` on list screens
- **Keyboard avoidance:** `ion-content` handles this
- **Streaming text:** progressive rendering for AI chat responses
- **Scroll behavior:** auto-scroll chat on new messages
- **Transitions:** page transitions, card entry animations (subtle)

## Step 7: Verify against screenshot

Compare your implementation at 375px viewport against the Figma screenshot:
- Layout matches (element positions, sizes, alignment)
- Colors match (backgrounds, text, borders)
- Typography matches (font, size, weight)
- Spacing matches (padding, gaps, margins)
- Effects match (shadows, blurs, gradients)

Run Playwright visual snapshot to capture baseline.

## Checklist
- [ ] Figma MCP screenshot reviewed alongside implementation
- [ ] Ionic used for structure (header, content, footer, tabs, list)
- [ ] Custom SCSS for visual styling (gradients, glows, rounded cards, glass)
- [ ] ALL colors use design system CSS variables — no hardcoded hex
- [ ] ALL fonts use design system tokens — no raw font-family strings
- [ ] Loading/empty/error states added
- [ ] Touch targets 44x44pt minimum
- [ ] Tested at 375px width
- [ ] Asset images downloaded locally (Figma URLs expire in 7 days)
