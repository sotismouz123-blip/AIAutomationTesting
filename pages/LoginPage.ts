import { Page, Locator, expect } from '@playwright/test';
import { PageHelpers } from '../utils/PageHelpers';

export class LoginPage {
  readonly page: Page;
  private pageHelpers: PageHelpers;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly pageTitle: RegExp;

  // URLs
  readonly loginUrl = '/en/client-portal';

  constructor(page: Page) {
    this.page = page;
    this.pageHelpers = new PageHelpers(page);
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
   * Wait for successful login (navigation to home page)
   */
  async waitForLoginSuccess(): Promise<void> {
    console.log('-> Waiting for page navigation...');
  
    // Wait for DOM load (ignore timeout)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 })
      .catch(() => console.log('-> DOMContentLoaded timeout, continuing...'));
  
    await this.page.waitForTimeout(2000);
  
    const url = this.page.url();
    console.log(`-> Current URL: ${url}`);
  
    // Set the correct expected redirect URL
    const expectedUrl = '<<PUT_EXPECTED_URL_HERE>>';
  
    // 1. Check if redirect is correct
    if (url === expectedUrl || url.startsWith(expectedUrl)) {
      console.log('-> Login successful: correct redirect URL');
      return;
    }
  
    // 2. If still on login page → login failed
    const isLoginPage = url.includes('/client-portal') && !url.includes('/home');
    if (isLoginPage) {
      const errors = await this.page
        .locator('[class*="error"], [class*="alert"], [class*="message"]')
        .allTextContents();
  
      console.log('-> Login failed: still on login page');
      console.log(`-> Possible errors: ${errors.join(' | ')}`);
  
      throw new Error(`Login failed: still on login page. URL: ${url}`);
    }
  
    // 3. Any other redirect is wrong
    throw new Error(`Login redirect incorrect. Expected: ${expectedUrl}, got: ${url}`);
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

  /**
   * Get all navigation links on the login page
   */
  async getNavigationLinks(): Promise<Array<{ text: string; url: string | null; target: string | null }>> {
    return this.pageHelpers.getNavigationLinks();
  }

  /**
   * Click a button/link and wait for navigation
   */
  async clickElementAndWaitForNavigation(elementText: string): Promise<string> {
    return this.pageHelpers.clickElementAndWaitForNavigation(elementText);
  }

  /**
   * Go back to login page
   */
  async goBack(): Promise<void> {
    return this.pageHelpers.goBack();
  }

  /**
   * Verify current URL matches expected URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    return this.pageHelpers.verifyCurrentUrl(expectedUrl);
  }
}
