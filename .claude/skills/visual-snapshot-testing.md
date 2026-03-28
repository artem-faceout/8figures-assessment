# Skill: Visual Snapshot Testing with Playwright

## When to use
After implementing or modifying any screen/component. Captures screenshots and compares against baselines to catch visual regressions.

## Setup (one-time)
Already configured in `client/`. To verify:
```bash
cd client
npx playwright install chromium
npx playwright test --grep @visual
```

## How it works
1. Playwright launches a headless Chromium browser at mobile viewport (375x812 — iPhone 13 Mini)
2. Navigates to each route
3. Takes a screenshot
4. Compares against the saved baseline in `client/e2e/snapshots/`
5. If no baseline exists, creates one (first run)
6. If baseline exists and pixels differ beyond threshold, test FAILS

## Writing a visual test

```typescript
import { test, expect } from '@playwright/test';

test('dashboard screen matches baseline @visual', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixelRatio: 0.01,
  });
});

test('chat screen matches baseline @visual', async ({ page }) => {
  await page.goto('/chat');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('chat.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

## Test file location
- Tests: `client/e2e/visual/*.spec.ts`
- Baselines: `client/e2e/visual/*.spec.ts-snapshots/` (auto-generated)
- Config: `client/playwright.config.ts`

## Playwright config highlights
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
  },
  webServer: {
    command: 'npx ng serve --port 4200',
    port: 4200,
    reuseExistingServer: true,
  },
});
```

## Running tests

```bash
# Run all visual tests
npx playwright test --grep @visual

# Update baselines after intentional UI changes
npx playwright test --grep @visual --update-snapshots

# Run with UI mode for debugging
npx playwright test --grep @visual --ui
```

## When to update baselines
- After implementing a new screen → baselines auto-created on first run
- After intentional design changes → run with `--update-snapshots`
- NEVER update baselines to make a failing test pass without reviewing the diff

## Workflow integration
1. Implement screen per `figma-to-ionic.md`
2. Run visual tests → creates baseline
3. Review baseline screenshot — does it match the design?
4. If yes, commit the baseline
5. On subsequent changes, tests catch unintended visual regressions

## Mock data for snapshots
Visual tests should use deterministic mock data so screenshots are stable:
- Mock the API responses in Playwright (route interception)
- Use fixed dates/times (no "2 hours ago" that changes)
- Use consistent portfolio values

## Checklist
- [ ] Test exists for every screen route
- [ ] Baselines committed to git
- [ ] Mock data is deterministic (no timestamps, no random values)
- [ ] Tests pass locally before committing
- [ ] Tests tagged with `@visual` for selective running
