import { test, expect } from '@playwright/test';

test('onboarding screen matches baseline @visual', async ({ page }) => {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('onboarding.png', {
    maxDiffPixelRatio: 0.01,
  });
});
