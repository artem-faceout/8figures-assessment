import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iPhone 13 Mini',
      use: {
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 3,
      },
    },
    {
      name: 'iPhone SE',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: 'npx ng serve --port 4200',
    port: 4200,
    reuseExistingServer: true,
  },
});
