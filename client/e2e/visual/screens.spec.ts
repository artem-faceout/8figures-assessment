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
