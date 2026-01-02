const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('https://ironfx-com.cp-uat.ironfx.local/en/client-portal', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('Page loaded successfully!');

    // Wait a bit for the page to fully render
    await page.waitForTimeout(2000);

    // Get page title
    const title = await page.title();
    console.log('\nPage Title:', title);

    // Find all input fields
    console.log('\n=== Finding Input Fields ===');
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input fields\n`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');

      console.log(`Input ${i + 1}:`);
      console.log(`  Type: ${type}`);
      console.log(`  Name: ${name}`);
      console.log(`  ID: ${id}`);
      console.log(`  Placeholder: ${placeholder}`);
      console.log(`  Class: ${className}`);
      console.log('');
    }

    // Find all buttons
    console.log('=== Finding Buttons ===');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons\n`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const type = await button.getAttribute('type');
      const text = await button.textContent();
      const id = await button.getAttribute('id');
      const className = await button.getAttribute('class');

      console.log(`Button ${i + 1}:`);
      console.log(`  Type: ${type}`);
      console.log(`  Text: ${text?.trim()}`);
      console.log(`  ID: ${id}`);
      console.log(`  Class: ${className}`);
      console.log('');
    }

    // Save a screenshot
    await page.screenshot({ path: 'login-page-screenshot.png', fullPage: true });
    console.log('Screenshot saved as login-page-screenshot.png');

    // Get the HTML of the form
    const formHTML = await page.content();
    const fs = require('fs');
    fs.writeFileSync('page-source.html', formHTML);
    console.log('Page source saved as page-source.html');

    console.log('\nKeeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');

    // Keep browser open for manual inspection
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
