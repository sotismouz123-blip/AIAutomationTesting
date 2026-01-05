const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  try {
    console.log('Navigating to register page...');
    await page.goto('https://ironfx-com.cp-uat.ironfx.local/en/register', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Page loaded successfully\n');

    // Find all input fields
    const inputs = await page.$$eval('input', els =>
      els.map(el => ({
        type: el.type || 'text',
        id: el.id || 'N/A',
        name: el.name || 'N/A',
        placeholder: el.placeholder || 'N/A'
      }))
    );

    console.log('INPUT FIELDS:');
    inputs.forEach((input, i) => {
      console.log(`${i + 1}. Type: ${input.type}, ID: ${input.id}, Name: ${input.name}, Placeholder: ${input.placeholder}`);
    });

    // Find all select dropdowns
    const selects = await page.$$eval('select', els =>
      els.map(el => ({
        id: el.id || 'N/A',
        name: el.name || 'N/A',
        options: Array.from(el.options).slice(0, 5).map(o => o.text)
      }))
    );

    console.log('\nSELECT DROPDOWNS:');
    selects.forEach((select, i) => {
      console.log(`${i + 1}. ID: ${select.id}, Name: ${select.name}`);
      console.log(`   Options (first 5): ${select.options.join(', ')}`);
    });

    // Find submit button
    const buttons = await page.$$eval('button, input[type=submit]', els =>
      els.map(el => ({
        tag: el.tagName,
        type: el.type || 'N/A',
        text: el.textContent?.trim() || el.value || 'N/A',
        class: el.className
      }))
    );

    console.log('\nBUTTONS:');
    buttons.forEach((btn, i) => {
      console.log(`${i + 1}. ${btn.tag} - Type: ${btn.type}, Text: ${btn.text}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'register-page-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved: register-page-screenshot.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
