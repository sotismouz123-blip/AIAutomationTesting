import { test, expect } from '../../fixtures/testSetup';

// Test descriptions map
const testDescriptions: Record<string, string> = {
  'data-driven-login': 'Data-driven login test that validates successful user authentication with valid credentials across multiple email accounts.',
  'form-elements': 'Validates that all login form elements (email input, password input, login button) are visible and accessible on page load.',
  'empty-validation': 'Verifies that HTML5 form validation prevents login submission when required fields are empty.',
  'button-redirections': 'Verifies that all clickable links on the login page redirect to their expected URLs.',
  'language-selector': 'Verifies that selecting different languages redirects to the correct URL and displays content in the selected language.'
};

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
      testInfo.annotations.push({ type: 'description', description: testDescriptions['data-driven-login'] });
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

  test('should display login form elements', async ({ loginPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['form-elements'] });

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

  test('should show validation for empty fields', async ({ loginPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['empty-validation'] });

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

  test('should redirect to correct URLs when clicking buttons', async ({ loginPage }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['button-redirections'] });

    const buttonsToTest = [
      { text: 'Contact', expectedUrl: 'ironfx/contact-us', newTab: true },
      { text: 'Register', expectedUrl: 'register', newTab: true },
      { text: 'Forgot password?', expectedUrl: 'forgot', newTab: false },
      { text: 'Open A Trading Account', expectedUrl: 'register', newTab: true },
      { text: 'Open Demo Account', expectedUrl: 'demo', newTab: true },
      { text: 'Legal Documents', expectedUrl: 'legal-documents', newTab: true },
      { text: 'Cookie Policy', expectedUrl: 'cookie-policy', newTab: true }
    ];

    for (const button of buttonsToTest) {
      await loginPage.navigate();

      const link = loginPage.page.locator(`a:has-text("${button.text}")`).first();

      if (button.newTab) {
        const [newPage] = await Promise.all([
          loginPage.page.context().waitForEvent('page'),
          link.click()
        ]);

        await newPage.waitForTimeout(3000);
        const newUrl = newPage.url();
        expect(newUrl).toContain(button.expectedUrl);
        await newPage.close();
      } else {
        await link.click();
        await loginPage.page.waitForTimeout(3000);
        const currentUrl = loginPage.page.url();
        expect(currentUrl).toContain(button.expectedUrl);
      }
    }

    // Single screenshot at the end
    await loginPage.navigate();
    const screenshotBuffer = await loginPage.page.screenshot();
    await test.info().attach('All redirects verified', { body: screenshotBuffer, contentType: 'image/png' });
  });

  test('should change language when selecting different languages', async ({ loginPage }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['language-selector'] });

    const languages = [
      { name: 'العربية', code: 'ar', expectedUrl: '/ar/client-portal', verifyWord: 'lang="ar"' },
      { name: 'Deutsch', code: 'de', expectedUrl: '/de/client-portal', verifyWord: 'lang="de"' },
      { name: 'English', code: 'en', expectedUrl: '/en/client-portal', verifyWord: 'lang="en"' },
      { name: 'Español', code: 'es', expectedUrl: '/es/client-portal', verifyWord: 'lang="es"' },
      { name: 'Français', code: 'fr', expectedUrl: '/fr/client-portal', verifyWord: 'lang="fr"' },
      { name: 'Italiano', code: 'it', expectedUrl: '/it/client-portal', verifyWord: 'lang="it"' }
    ];

    for (const lang of languages) {
      await loginPage.navigate();

      // Click on language dropdown to open it
      const languageDropdown = loginPage.page.locator('nav a[href="#"]').first();
      await languageDropdown.click();
      await loginPage.page.waitForTimeout(1000);

      // Click on the language link
      const languageLink = loginPage.page.locator(`a[href*="${lang.expectedUrl}"]`).first();
      await languageLink.scrollIntoViewIfNeeded();
      await languageLink.click({ noWaitAfter: true });
      await loginPage.page.waitForTimeout(5000);

      expect(loginPage.page.url()).toContain(lang.expectedUrl);
      expect(await loginPage.page.content()).toContain(lang.verifyWord);
    }

    // Single screenshot at the end
    const screenshotBuffer = await loginPage.page.screenshot();
    await test.info().attach('All languages verified', { body: screenshotBuffer, contentType: 'image/png' });
  });
});
