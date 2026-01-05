import { test as base, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Define custom fixtures type
type CustomFixtures = {
  loginPage: LoginPage;
  testData: {
    emails: string[];
    password: string;
    selectedEmails: string[];
  };
  screenshotHelper: {
    attach: (name: string, quality?: number) => Promise<void>;
  };
};

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Login Page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Test data fixture
  testData: async ({}, use) => {
    const emails = require('../data/testData.json').emails;
    const password = require('../data/testData.json').password;

    // Support TEST_EMAIL environment variable for selective testing
    const selectedEmails = process.env.TEST_EMAIL
      ? process.env.TEST_EMAIL.split(',').map((e: string) => e.trim())
      : emails;

    await use({
      emails,
      password,
      selectedEmails
    });
  },

  // Screenshot helper fixture
  screenshotHelper: async ({ page }, use, testInfo: TestInfo) => {
    const helper = {
      attach: async (name: string, quality: number = 30) => {
        const screenshot = await page.screenshot({
          fullPage: true,
          type: 'jpeg',
          quality
        });
        await testInfo.attach(name, {
          body: screenshot,
          contentType: 'image/jpeg'
        });
      }
    };
    await use(helper);
  }
});

export { expect } from '@playwright/test';
