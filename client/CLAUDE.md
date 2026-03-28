# Client — Angular 21 + Capacitor 6 + Ionic

## Quick Start
```bash
npm install
ng serve                    # Dev server at localhost:4200
ng build && npx cap sync    # Build for Capacitor
npx cap open ios            # Open in Xcode
```

## Angular Rules (read root CLAUDE.md first)

- ALL components are standalone — never create an NgModule
- Use `inject()` for DI — never constructor injection
- Signals for state — RxJS only for HTTP calls and streams
- Feature components go in `src/app/features/<name>/`
- Shared components go in `src/app/shared/components/<name>/`
- All types/interfaces in `src/app/core/models/`
- Services in `src/app/core/services/`

## Ionic Rules

- Every page wraps content in `<ion-header>` + `<ion-content>`
- Use `<ion-card>`, `<ion-list>`, `<ion-item>` for layout — no raw divs
- Navigation: use `<ion-tabs>` for bottom tabs (Dashboard / Chat)
- Loading states: use `<ion-skeleton-text>` for shimmer effect
- Pull-to-refresh: `<ion-refresher>` inside `<ion-content>`

## Capacitor Notes

- After any UI change, rebuild: `ng build && npx cap sync`
- iOS dev: `npx cap open ios` → Run in Xcode
- WebView origin: `capacitor://localhost` — server CORS must allow this
- To test API on simulator: use machine's local IP, not localhost

## ESLint

- Config: `eslint.config.js` (flat config format)
- `@typescript-eslint/no-explicit-any: error` — enforced, no exceptions
- Run: `ng lint` or `npx eslint .`
- Must pass clean before every commit

## Visual Testing (Playwright)

- Config: `playwright.config.ts`
- Tests: `e2e/visual/*.spec.ts` — tagged with `@visual`
- Viewport: 375x812 (iPhone 13 Mini), 3x scale
- Run: `npx playwright test --grep @visual`
- Update baselines: `npx playwright test --grep @visual --update-snapshots`
- Baselines committed to git in `e2e/visual/*.spec.ts-snapshots/`
- First run after new screen: creates baseline automatically

## Theme

- `src/theme/variables.scss` — Ionic CSS variable overrides (colors, fonts)
- Imported in `src/styles.scss` before Ionic core CSS
- Design tokens defined in `.claude/skills/design-system.md`

## Environment Files

- `src/environments/environment.ts` — dev (localhost:8000)
- `src/environments/environment.prod.ts` — prod (configurable API URL)
