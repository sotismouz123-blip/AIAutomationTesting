import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly pageTitle: RegExp;
  readonly loginUrl = '/en/client-portal';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#inlineFieldLogin');
    this.passwordInput = page.locator('#inlineFieldPassword');
    this.loginButton = page.locator('button.btn-red.btn-login:has-text("Login")');
    this.pageTitle = /Log in to IronFX Client Portal/;
  }

  async navigate(): Promise<void> {
    console.log('   -> Navigating to login page...');
    await this.page.goto(this.loginUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log('   -> Login page loaded');
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    console.log('   -> Filling credentials...');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    console.log('   -> Credentials filled');
  }

  async clickLogin(): Promise<void> {
    console.log('   -> Clicking login button...');
    await this.loginButton.click();
    console.log('   -> Login button clicked');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickLogin();
  }

  async waitForLoginSuccess(timeout: number = 30000): Promise<void> {
    console.log('   -> Waiting for page navigation...');
    await this.page.waitForLoadState('networkidle', { timeout });

    const currentUrl = this.page.url();
    console.log(`   -> Current URL: ${currentUrl}`);

    const isStillOnLoginPage = currentUrl.includes('/en/client-portal') && !currentUrl.includes('/home');
    expect(isStillOnLoginPage).toBe(false);
    console.log('   -> Successfully logged in - Dashboard loaded');
  }

  async verifyFormElementsVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(this.pageTitle);
  }

  async isEmailFieldInvalid(): Promise<boolean> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
  }
}
