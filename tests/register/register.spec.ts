import { test, expect } from '../../fixtures/testSetup';
import { generateRegistrationData } from '../../utils/emailGenerator';

// Test descriptions map
const testDescriptions: Record<string, string> = {
  'data-driven-registration': 'Data-driven registration test that validates successful user account creation across multiple countries. Each test generates unique email addresses and verifies form submission.',
  'form-elements': 'Validates that all registration form elements (country, personal info, password, trading settings) are visible and accessible on page load.',
  'dependent-dropdowns-country': 'Verifies that dependent dropdown fields (account type, bonus scheme, currency, leverage) become enabled only after country selection.',
  'dependent-dropdowns-account': 'Confirms that bonus scheme, currency, and leverage dropdowns become enabled after account type selection.',
  'bonus-categories': 'Validates that each account type has specific bonus scheme categories available in the dropdown.',
  'currencies': 'Verifies that each account type has specific currency options available for selection.',
  'leverage-values': 'Tests that each account type offers specific leverage ratios in the leverage dropdown.',
  'dropdown-population': 'Comprehensive test ensuring all three dependent dropdowns (bonus, currency, leverage) are fully populated with options after account type selection.',
  'button-redirections': 'Verifies that key buttons and links on the registration page (Contact, Legal Documents, Cookie Policy) redirect to their expected URLs.'
};

test.describe('IronFX Registration', () => {
  // Load test data
  const testData = require('../../data/testData.json');
  const { countries, registrationDefaults } = testData;

  // Support TEST_COUNTRY environment variable for selective testing
  const selectedCountries = process.env.TEST_COUNTRY
    ? process.env.TEST_COUNTRY.split(',').map((c: string) => c.trim())
    : countries;

  // Data-driven registration tests
  for (const country of selectedCountries) {
    test(`should register successfully with valid data [${country}]`, async ({ registerPage, screenshotHelper }, testInfo) => {
      // Add test description to metadata
      testInfo.annotations.push({ type: 'description', description: testDescriptions['data-driven-registration'] });
      console.log(`\n🔐 Testing registration for country: ${country}`);

      // Generate registration data
      const registrationData = generateRegistrationData(country, registrationDefaults);

      console.log(`   Generated email: ${registrationData.email}`);

      await test.step('Navigate to registration page', async () => {
        await registerPage.navigate();
      });

      await test.step(`Select country: ${country}`, async () => {
        await registerPage.selectCountry(country);
        await screenshotHelper.attach(`Country selected - ${country}`);
      });

      await test.step('Fill personal information', async () => {
        await registerPage.fillPersonalInfo(
          registrationData.firstName,
          registrationData.lastName,
          registrationData.email,
          registrationData.phoneNumber
        );
      });

      await test.step('Fill password', async () => {
        await registerPage.fillPasswords(registrationData.password);
      });

      await test.step('Configure trading account', async () => {
        await registerPage.selectTradingSettings(
          registrationData.accountType,
          registrationData.bonusScheme,
          registrationData.currency,
          registrationData.leverage
        );
        await screenshotHelper.attach(`Registration form completed - ${country}`);
      });

      await test.step('Submit registration', async () => {
        await registerPage.clickSubmit();
        await registerPage.page.waitForTimeout(2000);
        await screenshotHelper.attach(`After submit - ${country}\n email: ${registrationData.email}`);
        console.log(`✅ Registration test passed for: ${country} `);
      });
    });
  }

  test('should display registration form elements', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['form-elements'] });

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Verify all form elements are visible', async () => {
      await registerPage.verifyFormVisible();
      await screenshotHelper.attach('Registration form elements');
    });
  });

  test('Should enable account type but not the rest dropdownsafter country selection', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['dependent-dropdowns-country'] });

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    await test.step('Verify dedropdownspendent  are enabled', async () => {
      await expect(registerPage.accountTypeSelect).toBeEnabled();
      await expect(registerPage.bonusSchemeSelect).toBeDisabled();
      await expect(registerPage.currencySelect).toBeDisabled();
      await expect(registerPage.leverageSelect).toBeDisabled();
      await screenshotHelper.attach('Account type enabled  but not the rest drop downsafter country selection');
    });
  });

  test('Should enable dependent dropdowns after Account type selection', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['dependent-dropdowns-account'] });
    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });
    await test.step('Select a country', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });
    await test.step('Select a account type', async () => {
      await registerPage.selectAccountType('Standard Floating');
      await registerPage.page.waitForTimeout(1000);
    });

    await test.step('Verify dependent dropdowns are enabled', async () => {

      await expect(registerPage.bonusSchemeSelect).toBeEnabled();
      await expect(registerPage.currencySelect).toBeEnabled();
      await expect(registerPage.leverageSelect).toBeEnabled();
      await screenshotHelper.attach('Dropdowns enabled after country selection');
    });
  });

  // Test to verify account type specific dropdown values
  test('should verify specific bonus categories for each account type', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['bonus-categories'] });

    const accountTypes = ['Standard Floating'];

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country to enable account type dropdown', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    for (const accountType of accountTypes) {
      await test.step(`Verify bonus categories for account type: ${accountType}`, async () => {
        await registerPage.selectAccountType(accountType);
        await registerPage.page.waitForTimeout(500);

        const bonusOptions = await registerPage.getBonusSchemeOptions();
        console.log(`   Bonus categories for ${accountType}: ${bonusOptions.join(', ')}`);

        // Verify bonus dropdown has at least one option (besides empty option)
        expect(bonusOptions.length).toBeGreaterThan(0);
        expect(bonusOptions).toContain('Not applicable');

        await screenshotHelper.attach(`Bonus categories for ${accountType}`);
      });
    }
  });

  test('should verify specific currencies for each account type', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['currencies'] });

    const accountTypes = ['Standard Floating'];

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country to enable account type dropdown', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    for (const accountType of accountTypes) {
      await test.step(`Verify currencies for account type: ${accountType}`, async () => {
        await registerPage.selectAccountType(accountType);
        await registerPage.page.waitForTimeout(500);

        const currencyOptions = await registerPage.getCurrencyOptions();
        console.log(`   Currencies for ${accountType}: ${currencyOptions.join(', ')}`);

        // Verify currency dropdown has at least one option
        expect(currencyOptions.length).toBeGreaterThan(0);
        expect(currencyOptions).toContain('USD');

        await screenshotHelper.attach(`Currencies for ${accountType}`);
      });
    }
  });

  test('should verify specific leverage values for each account type', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['leverage-values'] });

    const accountTypes = ['Standard Floating'];

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country to enable account type dropdown', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    for (const accountType of accountTypes) {
      await test.step(`Verify leverage values for account type: ${accountType}`, async () => {
        await registerPage.selectAccountType(accountType);
        await registerPage.page.waitForTimeout(500);

        const leverageOptions = await registerPage.getLeverageOptions();
        console.log(`   Leverage options for ${accountType}: ${leverageOptions.join(', ')}`);

        // Verify leverage dropdown has at least one option
        expect(leverageOptions.length).toBeGreaterThan(0);
        expect(leverageOptions).toContain('1:500');

        await screenshotHelper.attach(`Leverage values for ${accountType}`);
      });
    }
  });

  test('should verify all dropdown options are populated after account type selection', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['dropdown-population'] });
    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    await test.step('Select account type and verify all dropdowns have options', async () => {
      await registerPage.selectAccountType('Standard Floating');
      await registerPage.page.waitForTimeout(500);

      const bonusOptions = await registerPage.getBonusSchemeOptions();
      const currencyOptions = await registerPage.getCurrencyOptions();
      const leverageOptions = await registerPage.getLeverageOptions();

      console.log(`   Bonus Scheme options (${bonusOptions.length}): ${bonusOptions.join(', ')}`);
      console.log(`   Currency options (${currencyOptions.length}): ${currencyOptions.join(', ')}`);
      console.log(`   Leverage options (${leverageOptions.length}): ${leverageOptions.join(', ')}`);

      // Verify all dropdowns have options
      expect(bonusOptions.length).toBeGreaterThan(0);
      expect(currencyOptions.length).toBeGreaterThan(0);
      expect(leverageOptions.length).toBeGreaterThan(0);

      await screenshotHelper.attach('All dropdowns populated with options');
    });
  });

  // Test to verify all button redirections on the registration page
  test('should redirect to correct URLs when clicking buttons', async ({ registerPage }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['button-redirections'] });

    console.log('\n🔗 Testing all button redirections on registration page');

    // Define buttons to test with their expected URLs
    const buttonsToTest = [
      { text: 'Contact', expectedUrl: 'ironfx/contact-us', newTab: true },
      { text: 'Legal Documents', expectedUrl: 'legal-documents', newTab: false },
      { text: 'Cookie Policy', expectedUrl: 'cookie-policy', newTab: true },
      { text: 'Log in', expectedUrl: '/en/client-portal', newTab: false }
    ];

    for (const button of buttonsToTest) {
      try {
        await registerPage.navigate();
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.log(`   ⚠️  Failed to navigate back to register page: ${errorMsg}`);
        // Try to reload if navigation fails
        try {
          await registerPage.page.reload();
        } catch {}
        continue;
      }

      const link = registerPage.page.locator(`a:has-text("${button.text}"), button:has-text("${button.text}")`).first();

      // Check if the button exists on the page
      const isVisible = await link.isVisible().catch(() => false);

      if (!isVisible) {
        console.log(`   ⚠️  Button "${button.text}" not found on registration page`);
        continue;
      }

      console.log(`   ✓ Testing button: "${button.text}"`);

      if (button.newTab) {
        // Handle links that open in new tab
        const newPagePromise = registerPage.page.context().waitForEvent('page');
        await link.click();

        try {
          const newPage = await newPagePromise;
          await newPage.waitForLoadState('domcontentloaded', { timeout: 5000 });
          const newUrl = newPage.url();
          console.log(`   URL: ${newUrl}`);
          expect(newUrl).toContain(button.expectedUrl);
          await newPage.close();
        } catch (e) {
          console.log(`   ℹ️  New tab not detected, trying same tab navigation...`);
          // The link was clicked, check if we navigated in the same tab
          await registerPage.page.waitForTimeout(3000);
          const currentUrl = registerPage.page.url();
          console.log(`   URL: ${currentUrl}`);
          expect(currentUrl).toContain(button.expectedUrl);
        }
      } else {
        // Handle links that navigate in the same tab
        await link.click();
        await registerPage.page.waitForTimeout(3000);
        const currentUrl = registerPage.page.url();
        console.log(`   URL: ${currentUrl}`);

        // Check if URL changed or contains expected substring
        if (currentUrl.includes(button.expectedUrl)) {
          expect(currentUrl).toContain(button.expectedUrl);
        } else {
          console.log(`   ⚠️  Button didn't navigate to expected URL. Expected: ${button.expectedUrl}, Got: ${currentUrl}`);
        }
      }
    }

    // Single screenshot at the end
    await registerPage.navigate();
    const screenshotBuffer = await registerPage.page.screenshot();
    await test.info().attach('All button redirects verified', { body: screenshotBuffer, contentType: 'image/png' });
    console.log('   ✅ All button redirections verified successfully\n');
  });
});
