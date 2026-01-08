import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // URL
  readonly profileUrl = '/en/client-portal/myprofile/legacy';

  // Personal Information Section
  readonly nationalitySelect: Locator;
  readonly genderSelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly taxCountrySelect: Locator;
  readonly tinInput: Locator;

  // Address Section
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly townInput: Locator;
  readonly postcodeInput: Locator;
  readonly countryOfResidenceSelect: Locator;

  // Phone Section
  readonly landlinePrefixSelect: Locator;
  readonly landlineNumberInput: Locator;
  readonly mobilePrefixSelect: Locator;
  readonly mobileNumberInput: Locator;

  // Employment Section
  readonly employmentStatusSelect: Locator;
  readonly natureOfBusinessSelect: Locator;

  // Financial Section
  readonly sourceOfFundsSelect: Locator;
  readonly expectedDepositSelect: Locator;
  readonly annualIncomeSelect: Locator;
  readonly netWorthSelect: Locator;

  // Experience Section
  readonly seminarExperienceCheckbox: Locator;
  readonly seminarExperienceDropdown: Locator;
  readonly workExperienceCheckbox: Locator;

  // Frequency & Volume Section
  readonly frequencyDropdowns: Locator;
  readonly volumeDropdowns: Locator;

  // Action Button
  readonly updateButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Personal Information
    this.nationalitySelect = page.locator('#nationality');
    this.genderSelect = page.locator('#gender');
    this.dateOfBirthInput = page.locator('#date_of_birth');
    this.taxCountrySelect = page.locator('#tax_country');
    this.tinInput = page.locator('#tin');

    // Address
    this.address1Input = page.locator('#address_1');
    this.address2Input = page.locator('#address_2');
    this.townInput = page.locator('#town');
    this.postcodeInput = page.locator('#postcode');
    this.countryOfResidenceSelect = page.locator('#country_of_residence');

    // Phone
    this.landlinePrefixSelect = page.locator('#landline_prefix');
    this.landlineNumberInput = page.locator('#landline_number');
    this.mobilePrefixSelect = page.locator('#mobile_prefix');
    this.mobileNumberInput = page.locator('#mobile_number');

    // Employment
    this.employmentStatusSelect = page.locator('#employment_status');
    this.natureOfBusinessSelect = page.locator('#nature_of_business');

    // Financial
    this.sourceOfFundsSelect = page.locator('#source_of_funds');
    this.expectedDepositSelect = page.locator('#expected_deposit');
    this.annualIncomeSelect = page.locator('#annual_income');
    this.netWorthSelect = page.locator('#net_worth');

    // Experience
    this.seminarExperienceCheckbox = page.locator('#seminar_experience');
    this.seminarExperienceDropdown = page.locator('#seminar_experience_dropdown');
    this.workExperienceCheckbox = page.locator('#work_experience');

    // Frequency & Volume
    this.frequencyDropdowns = page.locator('[id^="frequency_"]');
    this.volumeDropdowns = page.locator('[id^="volume_"]');

    // Action Button
    this.updateButton = page.locator('button[type="submit"]:has-text("Update")');
  }

  /**
   * Navigate to Profile Page
   */
  async navigate(): Promise<void> {
    console.log('   -> Navigating to profile page...');
    await this.page.goto(this.profileUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log('   -> Profile page loaded');
  }

  /**
   * Verify all profile fields are visible
   */
  async verifyProfileFieldsVisible(): Promise<void> {
    console.log('   -> Verifying profile fields visibility...');
    await expect(this.nationalitySelect).toBeVisible();
    await expect(this.genderSelect).toBeVisible();
    await expect(this.dateOfBirthInput).toBeVisible();
    await expect(this.address1Input).toBeVisible();
    await expect(this.employmentStatusSelect).toBeVisible();
    await expect(this.updateButton).toBeVisible();
    console.log('   -> All profile fields are visible');
  }

  /**
   * Fill Personal Information
   */
  async fillPersonalInfo(
    nationality: string,
    gender: string,
    dateOfBirth: string,
    taxCountry: string,
    tin: string
  ): Promise<void> {
    console.log('   -> Filling personal information...');
    await this.nationalitySelect.selectOption({ label: nationality });
    await this.genderSelect.selectOption({ label: gender });
    await this.dateOfBirthInput.fill(dateOfBirth);
    await this.taxCountrySelect.selectOption({ label: taxCountry });
    await this.tinInput.fill(tin);
    console.log('   -> Personal information filled');
  }

  /**
   * Fill Address Information
   */
  async fillAddressInfo(
    address1: string,
    address2: string,
    town: string,
    postcode: string,
    countryOfResidence: string
  ): Promise<void> {
    console.log('   -> Filling address information...');
    await this.address1Input.fill(address1);
    await this.address2Input.fill(address2);
    await this.townInput.fill(town);
    await this.postcodeInput.fill(postcode);
    await this.countryOfResidenceSelect.selectOption({ label: countryOfResidence });
    console.log('   -> Address information filled');
  }

  /**
   * Fill Phone Information
   */
  async fillPhoneInfo(
    landlinePrefix: string,
    landlineNumber: string,
    mobilePrefix: string,
    mobileNumber: string
  ): Promise<void> {
    console.log('   -> Filling phone information...');
    await this.landlinePrefixSelect.selectOption({ label: landlinePrefix });
    await this.landlineNumberInput.fill(landlineNumber);
    await this.mobilePrefixSelect.selectOption({ label: mobilePrefix });
    await this.mobileNumberInput.fill(mobileNumber);
    console.log('   -> Phone information filled');
  }

  /**
   * Fill Employment Information
   */
  async fillEmploymentInfo(
    employmentStatus: string,
    natureOfBusiness: string
  ): Promise<void> {
    console.log('   -> Filling employment information...');
    await this.employmentStatusSelect.selectOption({ label: employmentStatus });
    await this.natureOfBusinessSelect.selectOption({ label: natureOfBusiness });
    console.log('   -> Employment information filled');
  }

  /**
   * Fill Financial Information
   */
  async fillFinancialInfo(
    sourceOfFunds: string,
    expectedDeposit: string,
    annualIncome: string,
    netWorth: string
  ): Promise<void> {
    console.log('   -> Filling financial information...');
    await this.sourceOfFundsSelect.selectOption({ label: sourceOfFunds });
    await this.expectedDepositSelect.selectOption({ label: expectedDeposit });
    await this.annualIncomeSelect.selectOption({ label: annualIncome });
    await this.netWorthSelect.selectOption({ label: netWorth });
    console.log('   -> Financial information filled');
  }

  /**
   * Fill Experience Information
   */
  async fillExperienceInfo(
    hasSeminarExperience: boolean,
    seminarExperienceType: string | null = null,
    hasWorkExperience: boolean = false
  ): Promise<void> {
    console.log('   -> Filling experience information...');

    if (hasSeminarExperience) {
      await this.seminarExperienceCheckbox.check();
      if (seminarExperienceType) {
        await this.seminarExperienceDropdown.selectOption({ label: seminarExperienceType });
      }
    }

    if (hasWorkExperience) {
      await this.workExperienceCheckbox.check();
    }

    console.log('   -> Experience information filled');
  }

  /**
   * Fill Frequency & Volume Information
   */
  async fillFrequencyAndVolume(frequencyValue: string, volumeValue: string): Promise<void> {
    console.log('   -> Filling frequency and volume...');

    const frequencyDropdowns = await this.frequencyDropdowns.all();
    for (const dropdown of frequencyDropdowns) {
      await dropdown.selectOption({ label: frequencyValue });
    }

    const volumeDropdowns = await this.volumeDropdowns.all();
    for (const dropdown of volumeDropdowns) {
      await dropdown.selectOption({ label: volumeValue });
    }

    console.log('   -> Frequency and volume filled');
  }

  /**
   * Click Update Button
   */
  async clickUpdate(): Promise<void> {
    console.log('   -> Clicking update button...');
    await this.updateButton.click();
    console.log('   -> Update button clicked');
  }

  /**
   * Complete profile update with all information
   */
  async completeProfileUpdate(profileData: any): Promise<void> {
    await this.fillPersonalInfo(
      profileData.nationality,
      profileData.gender,
      profileData.dateOfBirth,
      profileData.taxCountry,
      profileData.tin
    );

    await this.fillAddressInfo(
      profileData.address1,
      profileData.address2,
      profileData.town,
      profileData.postcode,
      profileData.countryOfResidence
    );

    await this.fillPhoneInfo(
      profileData.landlinePrefix,
      profileData.landlineNumber,
      profileData.mobilePrefix,
      profileData.mobileNumber
    );

    await this.fillEmploymentInfo(
      profileData.employmentStatus,
      profileData.natureOfBusiness
    );

    await this.fillFinancialInfo(
      profileData.sourceOfFunds,
      profileData.expectedDeposit,
      profileData.annualIncome,
      profileData.netWorth
    );

    await this.fillExperienceInfo(
      profileData.hasSeminarExperience,
      profileData.seminarExperienceType,
      profileData.hasWorkExperience
    );

    await this.fillFrequencyAndVolume(
      profileData.frequencyValue,
      profileData.volumeValue
    );

    await this.clickUpdate();
  }

  /**
   * Verify no error messages are displayed
   */
  async verifyNoErrors(): Promise<void> {
    console.log('   -> Verifying no error messages...');
    const errorElements = await this.page.locator('[class*="error"], [class*="alert"]').all();
    if (errorElements.length > 0) {
      throw new Error('Error messages found on profile page');
    }
    console.log('   -> No error messages found');
  }
}
