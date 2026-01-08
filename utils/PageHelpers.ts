import { Page } from '@playwright/test';

export class PageHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get all navigation links on the current page
   */
  async getNavigationLinks(): Promise<Array<{ text: string; url: string | null; target: string | null }>> {
    const links = await this.page.locator('a').all();
    const result: Array<{ text: string; url: string | null; target: string | null }> = [];

    for (const link of links) {
      const text = await link.textContent();
      const url = await link.getAttribute('href');
      const target = await link.getAttribute('target');

      if (text && text.trim()) {
        result.push({
          text: text.trim(),
          url,
          target
        });
      }
    }

    return result;
  }

  /**
   * Click an element and wait for navigation
   */
  async clickElementAndWaitForNavigation(elementText: string): Promise<string> {
    const element = this.page.locator(`a:has-text("${elementText}"), button:has-text("${elementText}")`).first();
    await element.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this.page.url();
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify current URL matches expected URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    const currentUrl = this.page.url();

    if (typeof expectedUrl === 'string') {
      if (!currentUrl.includes(expectedUrl)) {
        throw new Error(`URL mismatch. Expected: ${expectedUrl}, Got: ${currentUrl}`);
      }
    } else {
      if (!expectedUrl.test(currentUrl)) {
        throw new Error(`URL mismatch. Expected pattern: ${expectedUrl}, Got: ${currentUrl}`);
      }
    }
  }
}
