import { test, expect } from '../../fixtures/testSetup';
import { generateRegistrationData } from '../../utils/emailGenerator';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';

/**
 * SUCCESS VERIFICATION TEST CASE: TC_PROFILE_UPDATE_SUCCESS_001
 * Complete Profile Update - Success Verification
 *
 * This test verifies the complete flow:
 * 1. Register a new account
 * 2. Log in with new credentials
 * 3. Navigate to profile page
 * 4. Fill all profile fields
 * 5. Submit profile update successfully
 */

const testCountry = 'Germany';

test.describe('Profile Update - Success Verification', () => {
  const testData = require('../../data/testData.json');
  const { registrationDefaults } = testData;

  // Profile test data
  const profileData = {
    nationality: 'German',
    gender: 'Male',
    dateOfBirth: '15/06/1990',
    taxCountry: 'Germany',
    tin: '12345678901',
    address1: '123 Main Street',
    address2: 'Apartment 4B',
    town: 'Berlin',
    postcode: '10115',
    countryOfResidence: 'Germany',
    landlinePrefix: '+49',
    landlineNumber: '3032123456',
    mobilePrefix: '+49',
    mobileNumber: '1501234567',
    employmentStatus: 'Employed',
    natureOfBusiness: 'Finance',
    sourceOfFunds: 'Salary',
    expectedDeposit: '5000-10000',
    annualIncome: '50000-100000',
    netWorth: '100000-500000',
    hasSeminarExperience: true,
    seminarExperienceType: 'Advanced',
    hasWorkExperience: true,
    frequencyValue: 'Daily',
    volumeValue: 'High'
  };

  test('TC_PROFILE_UPDATE_SUCCESS_001: Complete Profile Update - Success Verification', async ({
    page,
    screenshotHelper
  }, testInfo) => {
    // Add test metadata
    testInfo.annotations.push({
      type: 'testCase',
      description: 'TC_PROFILE_UPDATE_SUCCESS_001'
    });
    testInfo.annotations.push({
      type: 'purpose',
      description: 'Verify complete profile update flow from registration through profile submission'
    });

    const registrationData = generateRegistrationData(testCountry, registrationDefaults);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  TC_PROFILE_UPDATE_SUCCESS_001: Profile Update Success Test');
    console.log('═══════════════════════════════════════════════════════════\n');

    // =====================================================================
    // STEP 1: REGISTER NEW ACCOUNT
    // =====================================================================
    await test.step('Step 1: Register new account with valid data', async () => {
      console.log('\n📝 STEP 1: REGISTER NEW ACCOUNT');
      console.log('─────────────────────────────────────────────────────────');

      await registerPage.navigate();
      await screenshotHelper.attach('Step 1.1: Registration page loaded');

      await registerPage.selectCountry(testCountry);
      console.log(`✓ Country selected: ${testCountry}`);

      await registerPage.fillPersonalInfo(
        registrationData.firstName,
        registrationData.lastName,
        registrationData.email,
        registrationData.phoneNumber
      );
      console.log(`✓ Personal info filled: ${registrationData.firstName} ${registrationData.lastName}`);
      console.log(`✓ Email: ${registrationData.email}`);

      await registerPage.fillPasswords(registrationData.password);
      console.log('✓ Passwords filled');

      await registerPage.selectTradingSettings(
        registrationData.accountType,
        registrationData.bonusScheme,
        registrationData.currency,
        registrationData.leverage
      );
      console.log(`✓ Trading settings: ${registrationData.accountType}, ${registrationData.currency}`);

      await registerPage.clickSubmit();
      await page.waitForTimeout(2000);
      await screenshotHelper.attach('Step 1.13: Registration submitted');

      console.log('✅ STEP 1 COMPLETE: Account registered successfully\n');
    });

    // =====================================================================
    // STEP 2: LOGIN WITH NEW ACCOUNT
    // =====================================================================
    await test.step('Step 2: Login with newly created credentials', async () => {
      console.log('🔐 STEP 2: LOGIN WITH NEW ACCOUNT');
      console.log('─────────────────────────────────────────────────────────');

      // Give the system a moment to process registration
      await page.waitForTimeout(1000);

      await loginPage.navigate();
      await screenshotHelper.attach('Step 2.1: Login page loaded');

      await loginPage.fillCredentials(registrationData.email, registrationData.password);
      console.log(`✓ Credentials entered: ${registrationData.email}`);

      await loginPage.clickLogin();
      await page.waitForTimeout(3000);
      await screenshotHelper.attach('Step 2.4: Login submitted');

      // Verify we're logged in (not on login page anymore)
      const currentUrl = page.url();
      if (currentUrl.includes('/client-portal')) {
        console.log(`✓ Successfully logged in. Current URL: ${currentUrl}`);
      } else {
        throw new Error(`Login failed. URL: ${currentUrl}`);
      }

      console.log('✅ STEP 2 COMPLETE: User logged in successfully\n');
    });

    // =====================================================================
    // STEP 3: NAVIGATE TO PROFILE PAGE
    // =====================================================================
    await test.step('Step 3: Navigate to profile page', async () => {
      console.log('👤 STEP 3: NAVIGATE TO PROFILE PAGE');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.navigate();
      await screenshotHelper.attach('Step 3.1: Profile page loaded');

      console.log(`✓ Profile page URL: ${page.url()}`);
      console.log('✅ STEP 3 COMPLETE: Profile page loaded\n');
    });

    // =====================================================================
    // STEP 4: VERIFY PROFILE FIELDS ARE VISIBLE
    // =====================================================================
    await test.step('Step 4: Verify all profile fields are visible', async () => {
      console.log('👁️  STEP 4: VERIFY PROFILE FIELDS VISIBILITY');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.verifyProfileFieldsVisible();
      await screenshotHelper.attach('Step 4: All profile fields visible');

      console.log('✓ Nationality field is visible');
      console.log('✓ Gender field is visible');
      console.log('✓ Date of Birth field is visible');
      console.log('✓ Address fields are visible');
      console.log('✓ Phone fields are visible');
      console.log('✓ Employment fields are visible');
      console.log('✓ Financial fields are visible');
      console.log('✓ Experience fields are visible');
      console.log('✓ Update button is visible');
      console.log('✅ STEP 4 COMPLETE: All fields verified\n');
    });

    // =====================================================================
    // STEP 5: FILL PERSONAL INFORMATION
    // =====================================================================
    await test.step('Step 5: Fill personal information', async () => {
      console.log('ℹ️  STEP 5: FILL PERSONAL INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillPersonalInfo(
        profileData.nationality,
        profileData.gender,
        profileData.dateOfBirth,
        profileData.taxCountry,
        profileData.tin
      );

      console.log(`✓ Nationality: ${profileData.nationality}`);
      console.log(`✓ Gender: ${profileData.gender}`);
      console.log(`✓ Date of Birth: ${profileData.dateOfBirth}`);
      console.log(`✓ Tax Country: ${profileData.taxCountry}`);
      console.log(`✓ TIN: ${profileData.tin}`);
      console.log('✅ STEP 5 COMPLETE: Personal information filled\n');
    });

    // =====================================================================
    // STEP 6: FILL ADDRESS INFORMATION
    // =====================================================================
    await test.step('Step 6: Fill address information', async () => {
      console.log('🏠 STEP 6: FILL ADDRESS INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillAddressInfo(
        profileData.address1,
        profileData.address2,
        profileData.town,
        profileData.postcode,
        profileData.countryOfResidence
      );

      console.log(`✓ Address 1: ${profileData.address1}`);
      console.log(`✓ Address 2: ${profileData.address2}`);
      console.log(`✓ Town: ${profileData.town}`);
      console.log(`✓ Postcode: ${profileData.postcode}`);
      console.log(`✓ Country of Residence: ${profileData.countryOfResidence}`);
      console.log('✅ STEP 6 COMPLETE: Address information filled\n');
    });

    // =====================================================================
    // STEP 7: FILL PHONE INFORMATION
    // =====================================================================
    await test.step('Step 7: Fill phone information', async () => {
      console.log('📱 STEP 7: FILL PHONE INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillPhoneInfo(
        profileData.landlinePrefix,
        profileData.landlineNumber,
        profileData.mobilePrefix,
        profileData.mobileNumber
      );

      console.log(`✓ Landline: ${profileData.landlinePrefix} ${profileData.landlineNumber}`);
      console.log(`✓ Mobile: ${profileData.mobilePrefix} ${profileData.mobileNumber}`);
      console.log('✅ STEP 7 COMPLETE: Phone information filled\n');
    });

    // =====================================================================
    // STEP 8: FILL EMPLOYMENT INFORMATION
    // =====================================================================
    await test.step('Step 8: Fill employment information', async () => {
      console.log('💼 STEP 8: FILL EMPLOYMENT INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillEmploymentInfo(
        profileData.employmentStatus,
        profileData.natureOfBusiness
      );

      console.log(`✓ Employment Status: ${profileData.employmentStatus}`);
      console.log(`✓ Nature of Business: ${profileData.natureOfBusiness}`);
      console.log('✅ STEP 8 COMPLETE: Employment information filled\n');
    });

    // =====================================================================
    // STEP 9: FILL FINANCIAL INFORMATION
    // =====================================================================
    await test.step('Step 9: Fill financial information', async () => {
      console.log('💰 STEP 9: FILL FINANCIAL INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillFinancialInfo(
        profileData.sourceOfFunds,
        profileData.expectedDeposit,
        profileData.annualIncome,
        profileData.netWorth
      );

      console.log(`✓ Source of Funds: ${profileData.sourceOfFunds}`);
      console.log(`✓ Expected Deposit: ${profileData.expectedDeposit}`);
      console.log(`✓ Annual Income: ${profileData.annualIncome}`);
      console.log(`✓ Net Worth: ${profileData.netWorth}`);
      console.log('✅ STEP 9 COMPLETE: Financial information filled\n');
    });

    // =====================================================================
    // STEP 10: FILL EXPERIENCE INFORMATION
    // =====================================================================
    await test.step('Step 10: Fill experience information', async () => {
      console.log('🎓 STEP 10: FILL EXPERIENCE INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillExperienceInfo(
        profileData.hasSeminarExperience,
        profileData.seminarExperienceType,
        profileData.hasWorkExperience
      );

      console.log(`✓ Seminar Experience: ${profileData.hasSeminarExperience ? 'Yes' : 'No'}`);
      console.log(`✓ Seminar Type: ${profileData.seminarExperienceType}`);
      console.log(`✓ Work Experience: ${profileData.hasWorkExperience ? 'Yes' : 'No'}`);
      console.log('✅ STEP 10 COMPLETE: Experience information filled\n');
    });

    // =====================================================================
    // STEP 11: FILL FREQUENCY & VOLUME INFORMATION
    // =====================================================================
    await test.step('Step 11: Fill frequency and volume information', async () => {
      console.log('📊 STEP 11: FILL FREQUENCY & VOLUME INFORMATION');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.fillFrequencyAndVolume(
        profileData.frequencyValue,
        profileData.volumeValue
      );

      console.log(`✓ Frequency: ${profileData.frequencyValue}`);
      console.log(`✓ Volume: ${profileData.volumeValue}`);
      console.log('✅ STEP 11 COMPLETE: Frequency and volume filled\n');
    });

    // =====================================================================
    // STEP 12: SUBMIT PROFILE UPDATE
    // =====================================================================
    await test.step('Step 12: Submit profile update and verify success', async () => {
      console.log('✉️  STEP 12: SUBMIT PROFILE UPDATE');
      console.log('─────────────────────────────────────────────────────────');

      await profilePage.clickUpdate();
      await page.waitForTimeout(2000);
      await screenshotHelper.attach('Step 12.2: Profile update submitted');

      // Verify no error messages
      await profilePage.verifyNoErrors();
      console.log('✓ No error messages displayed');

      console.log('✅ STEP 12 COMPLETE: Profile update submitted successfully\n');
    });

    // =====================================================================
    // FINAL VERIFICATION
    // =====================================================================
    await test.step('Final verification: Confirm successful completion', async () => {
      console.log('✅ FINAL VERIFICATION');
      console.log('═══════════════════════════════════════════════════════════');

      const finalUrl = page.url();
      console.log(`Current URL: ${finalUrl}`);

      // Take final screenshot
      await screenshotHelper.attach('Final: Profile update completed successfully');

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('  ✅ TC_PROFILE_UPDATE_SUCCESS_001: TEST PASSED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('\nTest Summary:');
      console.log('  ✓ Account registered successfully');
      console.log('  ✓ User logged in successfully');
      console.log('  ✓ Profile page navigated successfully');
      console.log('  ✓ All profile fields visible and interactive');
      console.log('  ✓ Personal information filled completely');
      console.log('  ✓ Address information filled completely');
      console.log('  ✓ Phone information filled completely');
      console.log('  ✓ Employment information filled completely');
      console.log('  ✓ Financial information filled completely');
      console.log('  ✓ Experience information filled completely');
      console.log('  ✓ Frequency and volume filled completely');
      console.log('  ✓ Profile update submitted without errors');
      console.log('  ✓ No validation errors displayed\n');
    });
  });
});
