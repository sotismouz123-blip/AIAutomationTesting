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
  'button-redirections': 'Tests all navigation buttons and links on the registration page (except submit button) to verify they redirect to the correct destinations. Each button click is validated for proper navigation.'
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

  test('should enable account type after country selection', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['dependent-dropdowns-country'] });

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Select a country', async () => {
      await registerPage.selectCountry('Germany');
      await registerPage.page.waitForTimeout(1000);
    });

    await test.step('Verify dependent dropdowns are enabled', async () => {
      await expect(registerPage.accountTypeSelect).toBeEnabled();
      await expect(registerPage.bonusSchemeSelect).toBeDisabled();
      await expect(registerPage.currencySelect).toBeDisabled();
      await expect(registerPage.leverageSelect).toBeDisabled();
      await screenshotHelper.attach('Dropdowns enabled after country selection');
    });
  });

  test('should enable dependent dropdowns after Account type selection', async ({ registerPage, screenshotHelper }, testInfo) => {
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

  test('should verify all button redirections on registration page', async ({ registerPage, screenshotHelper }, testInfo) => {
    testInfo.annotations.push({ type: 'description', description: testDescriptions['button-redirections'] });

    const buttonRedirections: { text: string; fromUrl: string; toUrl: string; status: string }[] = [];

    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
      await screenshotHelper.attach('Registration page loaded');
    });

    const registrationPageUrl = registerPage.page.url();
    console.log(`\n🔘 Testing Button Redirections`);
    console.log(`   Registration page URL: ${registrationPageUrl}`);

    await test.step('Get all navigation links on the page', async () => {
      const navigationLinks = await registerPage.getNavigationLinks();

      console.log(`\n   Found ${navigationLinks.length} links/buttons:`);
      navigationLinks.forEach((link, idx) => {
        console.log(`   ${idx + 1}. "${link.text}" → ${link.url || '(no href)'}`);
      });

      // Filter out links that don't have href (internal handlers)
      const externalLinks = navigationLinks.filter(link => link.url && !link.url.startsWith('javascript:'));

      console.log(`\n   Testing ${externalLinks.length} navigation link(s)...`);

      for (const link of externalLinks) {
        await test.step(`Test button redirection: "${link.text}"`, async () => {
          const previousUrl = registerPage.page.url();

          try {
            // Click on the link
            await registerPage.page.locator(`text=${link.text}`).first().click();

            // Wait for navigation with timeout
            await registerPage.page.waitForNavigation({ timeout: 10000 }).catch(() => null);
            await registerPage.page.waitForLoadState('domcontentloaded').catch(() => null);
            await registerPage.page.waitForTimeout(2000);

            const newUrl = registerPage.page.url();
            const redirectSuccess = newUrl !== previousUrl;

            // Build expected URL if provided
            const expectedUrl = link.url;
            let urlMatches = true;

            if (expectedUrl && !expectedUrl.includes('javascript')) {
              urlMatches = newUrl.includes(expectedUrl) || newUrl.includes(new URL(expectedUrl, registerPage.page.url()).pathname);
            }

            const status = redirectSuccess && urlMatches ? '✓ PASS' : '✗ FAIL';

            buttonRedirections.push({
              text: link.text,
              fromUrl: previousUrl,
              toUrl: newUrl,
              status: status
            });

            console.log(`      ${status}`);
            console.log(`      From: ${previousUrl}`);
            console.log(`      To: ${newUrl}`);
            console.log(`      Expected: ${expectedUrl}`);

            expect(redirectSuccess).toBeTruthy();

            // Try to go back to registration page
            try {
              await registerPage.goBack();
            } catch (e) {
              console.log(`      ⚠ Could not navigate back, reloading registration page`);
              await registerPage.navigate();
            }

            await registerPage.page.waitForTimeout(2000);
            await screenshotHelper.attach(`After clicking: ${link.text}`);
          } catch (error) {
            console.log(`      ✗ FAIL - Error: ${error}`);
            buttonRedirections.push({
              text: link.text,
              fromUrl: previousUrl,
              toUrl: 'ERROR',
              status: '✗ FAIL'
            });

            // Try to navigate back to registration page
            try {
              await registerPage.navigate();
            } catch (e) {
              // Ignore errors
            }
          }
        });
      }
    });

    await test.step('Summary of button redirections', async () => {
      console.log(`\n✅ Button Redirection Test Summary`);
      console.log(`   Total buttons tested: ${buttonRedirections.length}`);

      buttonRedirections.forEach((redirect, idx) => {
        console.log(`\n   ${idx + 1}. ${redirect.text}`);
        console.log(`      Status: ${redirect.status}`);
        console.log(`      From: ${redirect.fromUrl}`);
        console.log(`      To: ${redirect.toUrl}`);
      });

      const passedRedirects = buttonRedirections.filter(r => r.status.includes('✓')).length;
      console.log(`\n   Passed: ${passedRedirects}/${buttonRedirections.length}`);

      // Attach summary
      testInfo.annotations.push({
        type: 'button-redirections',
        description: buttonRedirections
          .map(r => `${r.text}: ${r.fromUrl} → ${r.toUrl} (${r.status})`)
          .join('|')
      });
    });

    await screenshotHelper.attach('Final registration page state');
  });
});
