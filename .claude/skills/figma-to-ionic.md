# Skill: Figma to Ionic Translation

## When to use
When implementing a screen or component from a Figma design (or any visual mockup).

## Step-by-step process

### 1. Read the design
- Identify every distinct element in the frame (headers, cards, lists, buttons, inputs, etc.)
- Note the layout direction (vertical scroll? tabs? split view?)
- Extract colors, font sizes, and spacing — cross-reference with `design-system.md`
- Identify interactive elements (tappable items, inputs, scroll areas)

### 2. Map to Ionic components
Use this lookup table. ALWAYS prefer Ionic components over raw HTML.

| Figma element | Ionic component |
|---------------|----------------|
| Top bar with title | `ion-header` + `ion-toolbar` + `ion-title` |
| Top bar with back button | `ion-header` + `ion-toolbar` + `ion-back-button` + `ion-title` |
| Scrollable page content | `ion-content` |
| Card / elevated container | `ion-card` + `ion-card-header` + `ion-card-content` |
| Vertical list of items | `ion-list` + `ion-item` |
| List item with icon + text | `ion-item` + `ion-icon[slot=start]` + `ion-label` |
| List item with right-side value | `ion-item` + `ion-label` + `ion-note[slot=end]` |
| Bottom tab navigation | `ion-tabs` + `ion-tab-bar` + `ion-tab-button` |
| Primary button | `ion-button` |
| Text input | `ion-input` inside `ion-item` |
| Text area (chat input) | `ion-textarea` inside `ion-item` |
| Badge / chip | `ion-badge` or `ion-chip` |
| Loading spinner | `ion-spinner` |
| Skeleton placeholder | `ion-skeleton-text` |
| Pull-to-refresh | `ion-refresher` + `ion-refresher-content` inside `ion-content` |
| Floating action button | `ion-fab` + `ion-fab-button` |
| Modal / bottom sheet | `ion-modal` |
| Segment / tab switcher | `ion-segment` + `ion-segment-button` |
| Avatar / circular image | `ion-avatar` + `img` |
| Divider line | `ion-item-divider` or list `lines` property |
| Empty state illustration | Custom component inside `ion-content` with centered text |

### 3. Determine page structure
Every screen follows this skeleton:
```html
<ion-header>
  <ion-toolbar>
    <ion-title>Screen Name</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Scrollable content here -->
</ion-content>
```

If the screen has a fixed bottom input (like chat), use:
```html
<ion-content>
  <!-- Messages -->
</ion-content>

<ion-footer>
  <ion-toolbar>
    <!-- Input bar -->
  </ion-toolbar>
</ion-footer>
```

### 4. Handle layout within Ionic components
- Horizontal layouts inside `ion-item`: use `slot="start"`, `slot="end"`, default slot
- Grids: use `ion-grid` + `ion-row` + `ion-col` (NOT CSS grid or flexbox divs)
- Vertical spacing between sections: use Ionic padding utilities or spacing tokens from design system
- NEVER use raw `<div>` for layout structure — always Ionic primitives

### 5. Apply design tokens
- Colors: reference `design-system.md`, use Ionic color attributes where possible (`color="success"`, `color="danger"`)
- Typography: use design system scale, apply via CSS classes
- Spacing: use Ionic utilities (`class="ion-padding"`) or design system rem values
- If a color/size doesn't exist in the design system, ADD it to design-system.md first, then use it

### 6. Handle what Figma can't show
Figma is static. Add these behaviors that aren't visible in mockups:
- Loading states: `ion-skeleton-text` shimmer for every data-dependent element
- Empty states: meaningful message + illustration when no data
- Error states: `ion-toast` or inline error message for API failures
- Pull-to-refresh on list screens
- Keyboard avoidance on input screens

## Common mistakes
- Using `<div class="card">` instead of `<ion-card>` — ALWAYS use Ionic
- Forgetting `ion-content` wrapping — content won't scroll without it
- Hardcoding colors in SCSS instead of using Ionic CSS variables
- Using `position: fixed` for bottom bars — use `ion-footer` instead
- Forgetting safe area — `ion-header` and `ion-content` handle it, raw HTML doesn't
- Ignoring `slot` attributes — Ionic items rely on slots for layout

## Checklist after implementation
- [ ] Every Figma element mapped to an Ionic component (no raw HTML layout)
- [ ] Colors match design system tokens (not hardcoded hex values)
- [ ] Typography matches design system scale
- [ ] Loading/empty/error states added
- [ ] Touch targets are 44x44pt minimum
- [ ] Tested at 375px width in browser
