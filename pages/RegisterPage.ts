import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
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
  readonly registerUrl = '/en/register';

  constructor(page: Page) {
    this.page = page;
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

  async navigate(): Promise<void> {
    console.log('   -> Navigating to register page...');
    await this.page.goto(this.registerUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log('   -> Register page loaded');
  }

  async selectCountry(country: string): Promise<void> {
    console.log(`   -> Selecting country: ${country}`);
    await this.countrySelect.selectOption({ label: country });
    await this.page.waitForTimeout(1000);
    console.log('   -> Country selected');
  }

  async fillPersonalInfo(firstName: string, lastName: string, email: string, phoneNumber: string): Promise<void> {
    console.log('   -> Filling personal information...');
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneNumberInput.fill(phoneNumber);
    console.log('   -> Personal information filled');
  }

  async fillPasswords(password: string): Promise<void> {
    console.log('   -> Filling password fields...');
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    console.log('   -> Passwords filled');
  }

  async selectAccountType(accountType: string): Promise<void> {
    console.log(`   -> Selecting account type: ${accountType}`);
    await this.accountTypeSelect.selectOption({ label: accountType });
    console.log('   -> Account type selected');
  }

  async selectTradingSettings(accountType: string, bonusScheme: string, currency: string, leverage: string): Promise<void> {
    console.log('   -> Configuring trading account settings...');
    await this.selectAccountType(accountType);
    await this.bonusSchemeSelect.selectOption({ label: bonusScheme });
    await this.currencySelect.selectOption({ label: currency });
    await this.leverageSelect.selectOption({ label: leverage });
    console.log('   -> Trading settings configured');
  }

  async clickSubmit(): Promise<void> {
    console.log('   -> Clicking submit button...');
    await this.submitButton.click();
    console.log('   -> Submit button clicked');
  }

  async verifyFormVisible(): Promise<void> {
    await expect(this.countrySelect).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async getBonusSchemeOptions(): Promise<string[]> {
    const options = await this.bonusSchemeSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  async getCurrencyOptions(): Promise<string[]> {
    const options = await this.currencySelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }

  async getLeverageOptions(): Promise<string[]> {
    const options = await this.leverageSelect.locator('option').allTextContents();
    return options.filter(opt => opt.trim() !== '' && !opt.toLowerCase().includes('select'));
  }
}
