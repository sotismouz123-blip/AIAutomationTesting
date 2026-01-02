import { test, expect } from '@playwright/test';

test.describe('IronFX Login', () => {
  const emails = [
    'nickchigg+AfghanistanTestDNlbXjDX@gmail.com',
    'nickchigg+AlbaniaTestlDwQKRzf@gmail.com',
    'nickchigg+AlgeriaTestDbxHjITo@gmail.com'
  ];
  const password = 'Password1!';

  for (const email of emails) {
    test(`should login successfully with valid credentials [${email}]`, async ({ page }) => {
      // Navigate to the login page
      await page.goto('/en/client-portal');

      // Wait for the page to load
      await page.waitForLoadState('domcontentloaded');

      // Fill in the email field using the exact ID from the page
      await page.fill('#inlineFieldLogin', email);

      // Fill in the password field using the exact ID from the page
      await page.fill('#inlineFieldPassword', password);

      // Click the red Login button
      await page.click('button.btn-red.btn-login:has-text("Login")');

      // Wait for navigation or next step after login
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Take a screenshot after clicking login for verification
      await page.screenshot({ path: `screenshots/after-login-click-${email.replace(/[^\w]/g, '_')}.png`, fullPage: true });

      // Verify we moved to next step or logged in
      // The URL should change or we should see some authenticated content
      const currentUrl = page.url();
      console.log(`Current URL after login for ${email}:`, currentUrl);

      // Check that we're not on the login page anymore or we see authenticated content
      const isStillOnLoginPage = currentUrl.includes('/en/client-portal') && !currentUrl.includes('/home');
      expect(isStillOnLoginPage).toBe(false);
    });
  }

  test('should display login form elements', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/en/client-portal');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify the login form elements are visible
    await expect(page.locator('#inlineFieldLogin')).toBeVisible();
    await expect(page.locator('#inlineFieldPassword')).toBeVisible();

    // Check for the red Login button
    await expect(page.locator('button.btn-red.btn-login:has-text("Login")')).toBeVisible();

    // Verify page title
    await expect(page).toHaveTitle(/Log in to IronFX Client Portal/);
  });

  test('should show validation for empty fields', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/en/client-portal');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Try to submit without filling fields
    await page.click('button.btn-red.btn-login:has-text("Login")');

    // HTML5 validation should prevent submission
    // Email field should be focused or show validation message
    const emailField = page.locator('#inlineFieldLogin');

    // Check if email field is invalid (HTML5 validation)
    const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});
