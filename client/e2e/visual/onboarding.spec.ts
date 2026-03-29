import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('Hook screen', async ({ page }) => {
    await expect(page.getByText('working for')).toBeVisible();
    await expect(page).toHaveScreenshot('onboarding-hook.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Promise screen', async ({ page }) => {
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Meet your AI')).toBeVisible();
    await expect(page).toHaveScreenshot('onboarding-promise.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Bridge screen', async ({ page }) => {
    await page.locator('app-onboarding-hook button').click();
    await expect(page.locator('app-onboarding-promise')).toBeVisible();
    await page.locator('app-onboarding-promise button').click();
    await expect(page.getByText('set up your portfolio')).toBeVisible();
    await expect(page).toHaveScreenshot('onboarding-bridge.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Bridge screen with selection', async ({ page }) => {
    await page.locator('app-onboarding-hook button').click();
    await expect(page.locator('app-onboarding-promise')).toBeVisible();
    await page.locator('app-onboarding-promise button').click();
    await expect(page.getByText('I have investments')).toBeVisible();
    await page.getByText('I have investments').click();
    await expect(page).toHaveScreenshot('onboarding-bridge-selected.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Paywall screen', async ({ page }) => {
    await page.locator('app-onboarding-hook button').click();
    await expect(page.locator('app-onboarding-promise')).toBeVisible();
    await page.locator('app-onboarding-promise button').click();
    await expect(page.getByText('I have investments')).toBeVisible();
    await page.getByText('I have investments').click();
    await page.getByRole('button', { name: /continue journey/i }).click();
    await expect(page.getByText('Unlock Your Financial Edge')).toBeVisible();
    await expect(page).toHaveScreenshot('onboarding-paywall.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
