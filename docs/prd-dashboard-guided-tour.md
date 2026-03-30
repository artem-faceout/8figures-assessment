# Feature: Dashboard Guided Tour

## Scope

- **Endpoints:** None (client-only feature, see api-contract.md)
- **Models:** TourStep, TourConfig constant, StorageKeys addition (see data-models.md)
- **Summary:** 4-step tooltip tour on first dashboard visit. Highlights portfolio summary, insight card, first holding row, and chat FAB. Signal-based state, localStorage persistence. Fires once.

## TDD Slice Order

1. **Model + config:** `tour.model.ts` -- TourStep interface, TOUR_STEPS constant, storage key
2. **TourService:** Signal-based state (`tourActive`, `currentStep`), `shouldShowTour()`, `start()`, `next()`, `dismiss()`, localStorage read/write. Unit tests cover full lifecycle and persistence.
3. **TourOverlayComponent (logic):** Reads current step config, queries `[data-tour]` element, computes rect + tooltip position. Unit test with mock DOM elements.
4. **TourOverlayComponent (template + styling):** Backdrop with clip-path cutout, tooltip with caret, Next/Got it button, aria attributes. Snapshot or render test.
5. **Dashboard integration:** Add `data-tour` attributes to template, inject TourService, call `start()` after portfolio loads when `shouldShowTour()` is true. Import TourOverlayComponent. Integration test.
6. **Transitions + polish:** 200ms fade-in, 150ms cross-fade between steps, backdrop tap to advance, resize listener, focus management.

## Files to Create

- `client/src/app/core/models/tour.model.ts` -- TourStep interface, TOUR_STEPS config array, TOUR_STORAGE_KEY constant
- `client/src/app/core/services/tour.service.ts` -- TourService (providedIn root)
- `client/src/app/core/services/tour.service.spec.ts` -- TourService unit tests
- `client/src/app/shared/components/tour-overlay/tour-overlay.component.ts` -- standalone component
- `client/src/app/shared/components/tour-overlay/tour-overlay.component.html` -- template
- `client/src/app/shared/components/tour-overlay/tour-overlay.component.scss` -- styles
- `client/src/app/shared/components/tour-overlay/tour-overlay.component.spec.ts` -- component tests

## Files to Modify

- `client/src/app/features/dashboard/dashboard.page.ts` -- inject TourService, trigger tour after portfolio loads, add TourOverlayComponent to imports
- `client/src/app/features/dashboard/dashboard.page.html` -- add `data-tour` attributes to 4 elements, add `<app-tour-overlay>` conditionally
- `client/src/app/features/dashboard/dashboard.page.spec.ts` -- add test for tour trigger behavior
- `client/src/app/core/models/onboarding.model.ts` -- add `tourCompleted` key to STORAGE_KEYS (or define separately in tour.model.ts -- prefer separate to avoid coupling)

## Key Design Decisions

- **localStorage, not Capacitor Preferences:** Tour uses plain `localStorage` (sync API) for simplicity. Onboarding uses `@capacitor/preferences` (async). This is intentional -- tour check is synchronous and blocking render would be worse.
- **clip-path polygon for cutout:** No extra canvas or SVG. Pure CSS clip-path with computed polygon points from getBoundingClientRect.
- **Backdrop tap advances:** No skip button needed. 4 short steps + tap-anywhere keeps it frictionless.
- **Separate storage key namespace:** `8f_tour_completed` in tour.model.ts, not added to onboarding STORAGE_KEYS. Tour is a distinct concern.

## Edge Cases

- **Target element not found:** If `querySelector('[data-tour="..."]')` returns null (e.g., insight card not rendered yet), skip that step silently.
- **Window resize during tour:** Recalculate rect on resize (debounced). Also recalculate on step change.
- **Portfolio not loaded:** Tour only starts after portfolio signal is truthy -- no race condition.
- **Returning user:** `shouldShowTour()` checks localStorage first -- fast, no flicker.

## Accessibility

- Tooltip: `role="tooltip"`, `aria-live="polite"`
- Focus moves to action button on each step transition
- Button labels: "Next" (steps 0-2), "Got it" (step 3)

## Prerequisites

- [x] API contract noted (no endpoints)
- [x] Data models defined (client-only)
- [x] Design spec reviewed (docs/superpowers/specs/2026-03-30-dashboard-guided-tour-design.md)

## Execution Strategy

Single-feature prep. No parallel execution needed. One feature session runs all 6 TDD slices sequentially.
