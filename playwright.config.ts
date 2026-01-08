import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 3,
  reporter: [
    ['html'],
    ['./utils/custom-reporter.js']
  ],

  // Output directories
  outputDir: './test-results',

  use: {
    // Base URL for your tests
    baseURL: 'https://www.ironfx.com',

    // Ignore HTTPS certificate errors
    ignoreHTTPSErrors: false,

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
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.HEADLESS === 'false' ? 500 : 0,
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          channel: 'chrome',
          args: [
            '--incognito',
            '--start-maximized'
          ]
        }
      },
    },
    {
      name: 'firefox',
      use: {
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.HEADLESS === 'false' ? 500 : 0,
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['-private-window'],
          firefoxUserPrefs: {
            'browser.privatebrowsing.autostart': true
          }
        },
      },
    },
    {
      name: 'edge',
      use: {
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.HEADLESS === 'false' ? 500 : 0,
        viewport: { width: 1920, height: 1080 },
        channel: 'msedge',
        launchOptions: {
          args: [
            '--inprivate',
            '--start-maximized'
          ]
        }
      },
    },
  ],
});
