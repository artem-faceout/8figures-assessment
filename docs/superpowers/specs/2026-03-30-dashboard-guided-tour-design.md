# Dashboard Guided Tour — Design Spec

## Problem

Users complete onboarding and land on the dashboard without a clear "what now" moment. They see portfolio data but don't understand the key areas or how to interact. This hurts activation rate — users who don't engage on first visit are unlikely to return.

## Solution

A lightweight 4-step tooltip tour that fires once on first dashboard visit. Each step highlights a real UI element with a dimmed backdrop cutout and a short explanation. Takes ~10 seconds to complete.

## Target Metric

**Activation rate** — percentage of users who complete onboarding AND perform a meaningful action on the dashboard (tap a holding or open chat).

## Tour Steps

| Step | Target (`data-tour` attr) | Tooltip Text | Tooltip Position |
|------|--------------------------|-------------|-----------------|
| 1 | `portfolio-summary` | "Your portfolio at a glance — total value, daily change, and overall gain." | Below |
| 2 | `insight-card` | "AI-generated insights about your portfolio, refreshed daily." | Below |
| 3 | `holding-row` | "Tap any holding to see detailed performance and metrics." | Below |
| 4 | `chat-fab` | "Ask the AI anything about your investments." | Above |

## Technical Design

### New Files

| File | Purpose |
|------|---------|
| `shared/components/tour-overlay/tour-overlay.component.ts\|html\|scss` | Overlay UI — backdrop, cutout, tooltip, navigation |
| `core/services/tour.service.ts` | Tour state management — step tracking, completion flag |

### TourService

- Signal-based: `currentStep: WritableSignal<number>`, `tourActive: WritableSignal<boolean>`
- Completion persisted via `localStorage` key `tour_completed`
- Public API: `shouldShowTour(): boolean`, `start()`, `next()`, `dismiss()`
- `start()` sets `tourActive(true)`, `currentStep(0)`
- `next()` increments step; on last step, calls `dismiss()`
- `dismiss()` sets `tourActive(false)`, writes `tour_completed = true` to localStorage

### TourOverlayComponent

- Standalone component, rendered in `dashboard.page.html` conditionally: `@if (tourService.tourActive())`
- On each step:
  1. Queries `[data-tour="<step-key>"]` on the page
  2. Reads `getBoundingClientRect()` for target position/size
  3. Renders full-screen backdrop with CSS `clip-path: polygon()` cutout (8px padding, 8px border-radius around target)
  4. Positions tooltip above or below cutout based on step config
- Listens for window resize to recalculate positions

### Dashboard Integration

- In `dashboard.page.ts`: after portfolio signal is truthy, check `tourService.shouldShowTour()` and call `tourService.start()`
- Add `data-tour` attributes to existing template elements (no structural changes):
  - `<app-portfolio-summary data-tour="portfolio-summary">`
  - `<app-insight-card data-tour="insight-card">`
  - First `<app-holding-row data-tour="holding-row">`
  - `<ion-fab-button data-tour="chat-fab">`

### No Backend Changes

Tour is entirely client-side. No new API endpoints, no new data.

## Styling

- **Backdrop**: `rgba(0, 0, 0, 0.7)`, full-screen, `z-index` above all dashboard content
- **Cutout**: `clip-path: polygon()` with 8px padding and 8px border-radius around target
- **Tooltip**: `--ion-color-dark` background, white text, 14px body, max-width 280px, small caret pointing at cutout
- **Button**: "Next" on steps 1-3, "Got it" on step 4. Uses `--ion-color-primary`.
- **Transitions**: 200ms fade-in on tour start. 150ms cross-fade between steps (cutout position + tooltip).

## Interaction

- "Next" / "Got it" button advances or completes the tour
- Tapping the backdrop (outside cutout) also advances — no trapping
- No "Skip" button — 4 fast steps + backdrop-tap-to-advance makes skip unnecessary

## Accessibility

- Tooltip: `role="tooltip"`, `aria-live="polite"`
- Focus moves to "Next" / "Got it" button on each step transition

## Display Rules

- Tour fires once, on first dashboard visit after onboarding
- Completion stored in `localStorage` (`tour_completed`)
- No replay mechanism — first time only

## Scope Boundaries

- No analytics/tracking events (can be added later)
- No A/B testing variants
- No settings page integration
- No backend persistence of tour state
