import { Page, expect } from '@playwright/test';

/**
 * Common helper methods for page objects
 * Reduces code duplication between LoginPage and RegisterPage
 */
export class PageHelpers {
  constructor(private page: Page) {}

  /**
   * Get all navigation links on the page
   */
  async getNavigationLinks(): Promise<Array<{ text: string; url: string | null; target: string | null }>> {
    const links: Array<{ text: string; url: string | null; target: string | null }> = [];

    // Get all anchor tags
    const anchors = await this.page.locator('a').all();

    for (const anchor of anchors) {
      const text = await anchor.textContent();
      const href = await anchor.getAttribute('href');
      const target = await anchor.getAttribute('target');

      // Skip empty links
      if (text?.trim() && text.trim().length > 0 && text.trim().length < 100) {
        links.push({
          text: text.trim(),
          url: href,
          target: target
        });
      }
    }

    return links;
  }

  /**
   * Click an element and wait for navigation
   */
  async clickElementAndWaitForNavigation(elementText: string): Promise<string> {
    console.log(`   → Clicking element: "${elementText}"`);

    // Wait for navigation
    const navigationPromise = this.page.waitForNavigation({ timeout: 5000 }).catch(() => null);

    // Click the element
    await this.page.locator(`text=${elementText}`).first().click();

    // Wait for navigation to complete
    await navigationPromise;

    // Return the current URL
    const currentUrl = this.page.url();
    console.log(`   ✓ Navigated to: ${currentUrl}`);
    return currentUrl;
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    console.log('   → Going back...');
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle').catch(() => null);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    console.log('   ✓ Navigated back');
  }

  /**
   * Verify current URL matches expected URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    const currentUrl = this.page.url();
    if (typeof expectedUrl === 'string') {
      expect(currentUrl).toContain(expectedUrl);
    } else {
      expect(currentUrl).toMatch(expectedUrl);
    }
  }
}
