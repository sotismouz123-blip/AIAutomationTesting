import { Page, Locator, expect } from '@playwright/test';
import { PageHelpers } from '../utils/PageHelpers';

export class RegisterPage {
  readonly page: Page;
  private pageHelpers: PageHelpers;

  // Locators
  readonly countrySelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phonePrefixInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly accountTypeSelect: Locator;
  readonly bonusSchemeSelect: Locator;
  readonly currencySelect: Locator;
  readonly leverageSelect: Locator;
  readonly submitButton: Locator;

  // URLs
  readonly registerUrl = '/en/register';

  constructor(page: Page) {
    this.page = page;
    this.pageHelpers = new PageHelpers(page);
    this.countrySelect = page.locator('#country');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.emailInput = page.locator('#email');
    this.phonePrefixInput = page.locator('#phone_mobile_prefix');
    this.phoneNumberInput = page.locator('#phone_mobile');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirm_password');
    this.accountTypeSelect = page.locator('#account_type');
    this.bonusSchemeSelect = page.locator('#bonus_scheme');
    this.currencySelect = page.locator('#currency');
    this.leverageSelect = page.locator('#leverage');
    this.submitButton = page.locator('button[type="submit"]:has-text("Open your Trading Account")');
  }

  /**
   * Navigate to the registration page
   */
  async navigate(): Promise<void> {
    console.log('   → Navigating to register page...');
    await this.page.goto(this.registerUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log('   ✓ Register page loaded');
  }

  /**
   * Select country from dropdown
   */
  async selectCountry(country: string): Promise<void> {
    console.log(`   → Selecting country: ${country}`);
    await this.countrySelect.selectOption({ label: country });
    // Wait for dependent dropdowns to populate
    await this.page.waitForTimeout(1000);
    console.log('   ✓ Country selected');
  }

  /**
   * Fill first name
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill last name
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill email
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill phone number (prefix and number)
   */
  async fillPhoneNumber(phoneNumber: string): Promise<void> {
    console.log(`   → Filling phone number: ${phoneNumber}`);
    await this.phoneNumberInput.fill(phoneNumber);
    console.log('   ✓ Phone number filled');
  }

  /**
   * Fill password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill confirm password
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Fill all passwords
   */
  async fillPasswords(password: string): Promise<void> {
    console.log('   → Filling password fields...');
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    console.log('   ✓ Passwords filled');
  }

  /**
   * Fill personal information
   */
  async fillPersonalInfo(firstName: string, lastName: string, email: string, phoneNumber: string): Promise<void> {
    console.log('   → Filling personal information...');
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillEmail(email);
    await this.fillPhoneNumber(phoneNumber);
    console.log('   ✓ Personal information filled');
  }

  /**
   * Select account type
   */
  async selectAccountType(accountType: string): Promise<void> {
    console.log(`   → Selecting account type: ${accountType}`);
    await this.accountTypeSelect.selectOption({ label: accountType });
    console.log('   ✓ Account type selected');
  }

  /**
   * Select bonus scheme
   */
  async selectBonusScheme(bonusScheme: string): Promise<void> {
    console.log(`   → Selecting bonus scheme: ${bonusScheme}`);
    await this.bonusSchemeSelect.selectOption({ label: bonusScheme });
    console.log('   ✓ Bonus scheme selected');
  }

  /**
   * Select currency
   */
  async selectCurrency(currency: string): Promise<void> {
    console.log(`   → Selecting currency: ${currency}`);
    await this.currencySelect.selectOption({ label: currency });
    console.log('   ✓ Currency selected');
  }

  /**
   * Select leverage
   */
  async selectLeverage(leverage: string): Promise<void> {
    console.log(`   → Selecting leverage: ${leverage}`);
    await this.leverageSelect.selectOption({ label: leverage });
    console.log('   ✓ Leverage selected');
  }

  /**
   * Select all trading account settings
   */
  async selectTradingSettings(accountType: string, bonusScheme: string, currency: string, leverage: string): Promise<void> {
    console.log('   → Configuring trading account settings...');
    await this.selectAccountType(accountType);
    await this.selectBonusScheme(bonusScheme);
    await this.selectCurrency(currency);
    await this.selectLeverage(leverage);
    console.log('   ✓ Trading settings configured');
  }

  /**
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    console.log('   → Clicking submit button...');
    await this.submitButton.click();
    console.log('   ✓ Submit button clicked');
  }

  /**
   * Complete full registration flow
   */
  async register(data: {
    country: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    accountType: string;
    bonusScheme: string;
    currency: string;
    leverage: string;
  }): Promise<void> {
    await this.selectCountry(data.country);
    await this.fillPersonalInfo(data.firstName, data.lastName, data.email, data.phoneNumber);
    await this.fillPasswords(data.password);
    await this.selectTradingSettings(data.accountType, data.bonusScheme, data.currency, data.leverage);
    await this.clickSubmit();
  }

  /**
   * Take a screenshot with JPEG compression
   */
  async takeScreenshot(quality: number = 30): Promise<Buffer> {
    return await this.page.screenshot({
      fullPage: true,
      type: 'jpeg',
      quality
    });
  }

  /**
   * Verify form is visible
   */
  async verifyFormVisible(): Promise<void> {
    await expect(this.countrySelect).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Get all available options from bonus scheme dropdown (excluding "-- Select --")
   */
  async getBonusSchemeOptions(): Promise<string[]> {
    const options = await this.bonusSchemeSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  /**
   * Get all available options from currency dropdown (excluding "-- Select --")
   */
  async getCurrencyOptions(): Promise<string[]> {
    const options = await this.currencySelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  /**
   * Get all available options from leverage dropdown (excluding "-- Select --")
   */
  async getLeverageOptions(): Promise<string[]> {
    const options = await this.leverageSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  /**
   * Get all available account type options (excluding "-- Select --")
   */
  async getAccountTypeOptions(): Promise<string[]> {
    const options = await this.accountTypeSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  /**
   * Verify dropdown has options
   */
  async verifyDropdownHasOptions(dropdown: Locator, expectedOptions: string[]): Promise<void> {
    const actualOptions = await dropdown.locator('option').allTextContents();
    const filteredOptions = actualOptions.filter(opt => opt.trim() !== '');

    for (const expected of expectedOptions) {
      expect(filteredOptions).toContain(expected);
    }
  }

  /**
   * Verify a combination of trading settings is selected
   */
  async verifySelectedCombination(accountType: string, bonusScheme: string, currency: string, leverage: string): Promise<void> {
    const selectedAccountType = await this.accountTypeSelect.inputValue();
    const selectedBonus = await this.bonusSchemeSelect.inputValue();
    const selectedCurrency = await this.currencySelect.inputValue();
    const selectedLeverage = await this.leverageSelect.inputValue();

    expect(selectedAccountType).toBeTruthy();
    expect(selectedBonus).toBeTruthy();
    expect(selectedCurrency).toBeTruthy();
    expect(selectedLeverage).toBeTruthy();
  }

  /**
   * Get all available account types
   */
  async getAllAccountTypes(): Promise<string[]> {
    const options = await this.accountTypeSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '');
  }

  /**
   * Click a button and wait for navigation
   */
  async clickButtonAndWaitForNavigation(buttonText: string): Promise<string> {
    return this.pageHelpers.clickElementAndWaitForNavigation(buttonText);
  }

  /**
   * Get all footer/header links that typically redirect
   */
  async getNavigationLinks(): Promise<Array<{ text: string; url: string | null; target: string | null }>> {
    return this.pageHelpers.getNavigationLinks();
  }

  /**
   * Verify current URL matches expected URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    return this.pageHelpers.verifyCurrentUrl(expectedUrl);
  }

  /**
   * Go back to registration page
   */
  async goBack(): Promise<void> {
    return this.pageHelpers.goBack();
  }
}
