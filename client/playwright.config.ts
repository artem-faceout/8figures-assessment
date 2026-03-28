import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx ng serve --port 4200',
    port: 4200,
    reuseExistingServer: true,
  },
});
