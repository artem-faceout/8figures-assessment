import { test, expect } from '@playwright/test';

const mockPortfolio = {
  holdings: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      quantity: 50,
      cost_basis: 175.2,
      current_price: 198.45,
      value: 9922.5,
      daily_change_percent: 1.24,
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      quantity: 30,
      cost_basis: 380.5,
      current_price: 415.8,
      value: 12474.0,
      daily_change_percent: 0.89,
    },
    {
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      exchange: 'NYSEARCA',
      quantity: 25,
      cost_basis: 420.0,
      current_price: 448.6,
      value: 11215.0,
      daily_change_percent: 0.45,
    },
    {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      quantity: 15,
      cost_basis: 650.0,
      current_price: 725.3,
      value: 10879.5,
      daily_change_percent: -0.32,
    },
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      exchange: 'CRYPTO',
      quantity: 0.04,
      cost_basis: 62000.0,
      current_price: 68475.0,
      value: 2739.0,
      daily_change_percent: 2.15,
    },
  ],
  total_value: 47230.0,
  daily_change: 312.5,
  daily_change_percent: 0.67,
};

async function setupPortfolio(page: import('@playwright/test').Page) {
  await page.addInitScript((portfolio) => {
    // Capacitor Preferences web fallback uses CapacitorStorage. prefix
    localStorage.setItem('CapacitorStorage.8f_onboarding_complete', 'true');
    localStorage.setItem('CapacitorStorage.8f_investment_profile', 'experienced');
    localStorage.setItem('CapacitorStorage.8f_subscription_status', 'trial');
    // PortfolioService uses raw localStorage key
    localStorage.setItem('8f_portfolio', JSON.stringify(portfolio));
  }, mockPortfolio);
}

test.describe('Dashboard @visual', () => {
  test.beforeEach(async ({ page }) => {
    await setupPortfolio(page);

    // Mock the insight endpoint
    await page.route('**/api/v1/portfolio/insight', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ticker: 'NVDA',
            asset_name: 'NVIDIA Corporation',
            headline: 'NVDA MOMENTUM ALERT',
            body: 'NVIDIA is up 4.2% following the latest earnings report. Your position has grown by $1,240 this month.',
          },
          meta: { timestamp: '2026-03-30T10:00:00Z' },
        }),
      })
    );
  });

  test('Dashboard screen', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('HOLDINGS')).toBeVisible();
    // Wait for insight card to load
    await expect(page.getByText('NVDA MOMENTUM ALERT')).toBeVisible();
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Asset Detail @visual', () => {
  test.beforeEach(async ({ page }) => {
    await setupPortfolio(page);

    // Mock the metrics endpoint
    await page.route('**/api/v1/portfolio/AAPL/metrics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ticker: 'AAPL',
            pe_ratio: 32.1,
            market_cap: '$3.04T',
            day_range_low: 195.2,
            day_range_high: 199.1,
            volume: '45.2M',
          },
          meta: { timestamp: '2026-03-30T10:00:00Z' },
        }),
      })
    );

    // Mock the history endpoint
    await page.route('**/api/v1/portfolio/AAPL/history**', (route) => {
      const points = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(2026, 2, i + 1).toISOString(),
        price: 185 + Math.sin(i / 3) * 8 + i * 0.4,
      }));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { ticker: 'AAPL', range: '1M', points },
          meta: { timestamp: '2026-03-30T10:00:00Z' },
        }),
      });
    });

    // Mock insight for dashboard (in case of navigation)
    await page.route('**/api/v1/portfolio/insight', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ticker: 'AAPL',
            asset_name: 'Apple Inc.',
            headline: 'AAPL STRONG MOMENTUM',
            body: 'Apple is showing strong momentum.',
          },
          meta: {},
        }),
      })
    );
  });

  test('Asset detail screen', async ({ page }) => {
    await page.goto('/dashboard/asset/AAPL');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Apple Inc.')).toBeVisible();
    // Wait for metrics to load
    await expect(page.getByText('$3.04T')).toBeVisible();
    await expect(page).toHaveScreenshot('asset-detail-aapl.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
