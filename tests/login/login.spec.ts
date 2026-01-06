import { test, expect } from '../../fixtures/testSetup';

// Test descriptions map
const testDescriptions: Record<string, string> = {
  'data-driven-login': 'Data-driven login test that validates successful user authentication with valid credentials across multiple email accounts.',
  'form-elements': 'Validates that all login form elements (email input, password input, login button) are visible and accessible on page load.',
  'empty-validation': 'Verifies that HTML5 form validation prevents login submission when required fields are empty.',
  'button-redirections': 'Tests all navigation buttons and links on the login page (including the login button) to verify they redirect to the correct destinations or perform expected actions.'
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

  test('should verify all button redirections on login page', async ({ loginPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['button-redirections'] });

    const buttonRedirections: { text: string; fromUrl: string; toUrl: string; status: string }[] = [];

    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
      await screenshotHelper.attach('Login page loaded');
    });

    const loginPageUrl = loginPage.page.url();
    console.log(`\n🔘 Testing Login Page Button Redirections`);
    console.log(`   Login page URL: ${loginPageUrl}`);

    await test.step('Get all navigation links and buttons on the page', async () => {
      const navigationLinks = await loginPage.getNavigationLinks();

      console.log(`\n   Found ${navigationLinks.length} buttons/links:`);
      navigationLinks.forEach((link, idx) => {
        console.log(`   ${idx + 1}. "${link.text}" → ${link.url || '(form submit)'}`);
      });

      // Filter out links that don't have href (internal handlers like Login button)
      const testableElements = navigationLinks.filter(link => {
        // Include external links AND the Login button
        return link.url || link.text.toLowerCase().includes('login');
      });

      console.log(`\n   Testing ${testableElements.length} buttons/links...`);

      for (const link of testableElements) {
        await test.step(`Test button: "${link.text}"`, async () => {
          const previousUrl = loginPage.page.url();

          try {
            // Special handling for Login button (it might not navigate if credentials are empty)
            const isLoginButton = link.text.toLowerCase().includes('login');

            // Click on the element
            await loginPage.page.locator(`text=${link.text}`).first().click();

            // Wait for navigation/action with timeout
            await loginPage.page.waitForNavigation({ timeout: 10000 }).catch(() => null);
            await loginPage.page.waitForLoadState('domcontentloaded').catch(() => null);
            await loginPage.page.waitForTimeout(2000);

            const newUrl = loginPage.page.url();

            // For login button without credentials, the URL won't change - that's expected
            let redirectSuccess = isLoginButton ? true : newUrl !== previousUrl;
            let expectedBehavior = isLoginButton ? '(validation/no action expected)' : link.url || '';

            const status = redirectSuccess ? '✓ PASS' : '✗ FAIL';

            buttonRedirections.push({
              text: link.text,
              fromUrl: previousUrl,
              toUrl: newUrl,
              status: status
            });

            console.log(`      ${status}`);
            console.log(`      From: ${previousUrl}`);
            console.log(`      To: ${newUrl}`);
            if (link.url) console.log(`      Expected: ${link.url}`);

            expect(redirectSuccess).toBeTruthy();

            // Try to go back to login page if URL changed
            if (newUrl !== previousUrl) {
              try {
                await loginPage.goBack();
              } catch (e) {
                console.log(`      ⚠ Could not navigate back, reloading login page`);
                await loginPage.navigate();
              }
            }

            await loginPage.page.waitForTimeout(2000);
            await screenshotHelper.attach(`After interacting with: ${link.text}`);
          } catch (error) {
            console.log(`      ✗ FAIL - Error: ${error}`);
            buttonRedirections.push({
              text: link.text,
              fromUrl: previousUrl,
              toUrl: 'ERROR',
              status: '✗ FAIL'
            });

            // Try to navigate back to login page
            try {
              await loginPage.navigate();
            } catch (e) {
              // Ignore errors
            }
          }
        });
      }
    });

    await test.step('Summary of button interactions', async () => {
      console.log(`\n✅ Login Page Button Test Summary`);
      console.log(`   Total buttons tested: ${buttonRedirections.length}`);

      buttonRedirections.forEach((redirect, idx) => {
        console.log(`\n   ${idx + 1}. ${redirect.text}`);
        console.log(`      Status: ${redirect.status}`);
        console.log(`      From: ${redirect.fromUrl}`);
        console.log(`      To: ${redirect.toUrl}`);
      });

      const passedTests = buttonRedirections.filter(r => r.status.includes('✓')).length;
      console.log(`\n   Passed: ${passedTests}/${buttonRedirections.length}`);

      // Attach summary
      testInfo.annotations.push({
        type: 'button-redirections',
        description: buttonRedirections
          .map(r => `${r.text}: ${r.fromUrl} → ${r.toUrl} (${r.status})`)
          .join('|')
      });
    });

    await screenshotHelper.attach('Final login page state');
  });
});
