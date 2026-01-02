import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Output directories
  outputDir: './test-results',

  use: {
    // Base URL for your tests
    baseURL: 'https://ironfx-com.cp-uat.ironfx.local',

    // Ignore HTTPS certificate errors for UAT environment
    ignoreHTTPSErrors: true,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Timeout for each action
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Run tests in headed mode (visible browser)
        headless: false,
        // Slow down operations for better visibility
        slowMo: 500,
      },
    },
  ],
});
