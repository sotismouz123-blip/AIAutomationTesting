import { test, expect } from '../../fixtures/testSetup';
import { generateRegistrationData } from '../../utils/emailGenerator';

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
        await screenshotHelper.attach(`After submit - ${country}`);
        console.log(`✅ Registration test passed for: ${country}\n  email: ${registrationData.email}`);
      });
    });
  }

  test('should display registration form elements', async ({ registerPage, screenshotHelper }) => {
    await test.step('Navigate to registration page', async () => {
      await registerPage.navigate();
    });

    await test.step('Verify all form elements are visible', async () => {
      await registerPage.verifyFormVisible();
      await screenshotHelper.attach('Registration form elements');
    });
  });

  test('should enable dependent dropdowns after country selection', async ({ registerPage, screenshotHelper }) => {
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

  test('should enable dependent dropdowns after Account type selection', async ({ registerPage, screenshotHelper }) => {
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
});
