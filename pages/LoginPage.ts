import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly pageTitle: RegExp;

  // URLs
  readonly loginUrl = '/en/client-portal';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#inlineFieldLogin');
    this.passwordInput = page.locator('#inlineFieldPassword');
    this.loginButton = page.locator('button.btn-red.btn-login:has-text("Login")');
    this.pageTitle = /Log in to IronFX Client Portal/;
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    console.log('   -> Navigating to login page...');
    await this.page.goto(this.loginUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log('   -> Login page loaded');
  }

  /**
   * Fill the email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill the password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill both email and password fields
   */
  async fillCredentials(email: string, password: string): Promise<void> {
    console.log('   -> Filling credentials...');
    await this.fillEmail(email);
    await this.fillPassword(password);
    console.log('   -> Credentials filled');
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    console.log('   -> Clicking login button...');
    await this.loginButton.click();
    console.log('   -> Login button clicked');
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickLogin();
  }

  /**
   * Wait for successful login (navigation away from login page)
   */
  async waitForLoginSuccess(timeout: number = 30000): Promise<void> {
    console.log('   -> Waiting for page navigation...');
    await this.page.waitForLoadState('networkidle', { timeout });

    const currentUrl = this.page.url();
    console.log(`   -> Current URL: ${currentUrl}`);

    const isStillOnLoginPage = currentUrl.includes('/en/client-portal') && !currentUrl.includes('/home');
    expect(isStillOnLoginPage).toBe(false);
    console.log('   -> Successfully logged in - Dashboard loaded');
  }

  /**
   * Verify all form elements are visible
   */
  async verifyFormElementsVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(this.pageTitle);
  }

  /**
   * Check if email field has validation error
   */
  async isEmailFieldInvalid(): Promise<boolean> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
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
}
