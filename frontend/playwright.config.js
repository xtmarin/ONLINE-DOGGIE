// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    // TU FRONTEND REAL
    baseURL: 'http://127.0.0.1:5500/frontend',

    // abre navegador visible
    headless: false,

    // screenshots si falla
    screenshot: 'only-on-failure',

    // video si falla
    video: 'retain-on-failure',

    // trace para debug
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});