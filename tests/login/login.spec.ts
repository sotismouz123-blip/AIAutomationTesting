import { test, expect } from '../../fixtures/testSetup';

test.describe('IronFX Login', () => {
  // Load test data
  const testData = require('../../data/testData.json');
  const { password, emails } = testData;

  // Support TEST_EMAIL environment variable for selective testing
  const selectedEmails = process.env.TEST_EMAIL
    ? process.env.TEST_EMAIL.split(',').map((e: string) => e.trim())
    : emails;

  // Data-driven login tests
  for (const email of selectedEmails) {
    test(`should login successfully with valid credentials [${email}]`, async ({ loginPage, screenshotHelper }, testInfo) => {
      console.log(`\n Testing login for: ${email}`);

      await test.step('Navigate to login page', async () => {
        await loginPage.navigate();
      });

      await test.step(`Fill credentials for ${email}`, async () => {
        await loginPage.fillCredentials(email, password);
        await screenshotHelper.attach(`Login page - ${email}`);
      });

      await test.step('Click login button', async () => {
        await loginPage.clickLogin();
      });

      await test.step('Verify successful login', async () => {
        await loginPage.waitForLoginSuccess();
        await screenshotHelper.attach(`Dashboard - ${email}`);
        console.log(`Login test passed for: ${email}\n`);
      });
    });
  }

  test('should display login form elements', async ({ loginPage, screenshotHelper }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Verify all form elements are visible', async () => {
      await loginPage.verifyFormElementsVisible();
    });

    await test.step('Verify page title', async () => {
      await loginPage.verifyPageTitle();
      await screenshotHelper.attach('Login form elements');
    });
  });

  test('should show validation for empty fields', async ({ loginPage, screenshotHelper }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Click login without filling fields', async () => {
      await loginPage.clickLogin();
    });

    await test.step('Verify HTML5 validation prevents submission', async () => {
      const isInvalid = await loginPage.isEmailFieldInvalid();
      expect(isInvalid).toBe(true);
      await screenshotHelper.attach('Validation error');
    });
  });
});
