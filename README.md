# IronFX Login Test Automation

Automated test framework for IronFX Client Portal login functionality using Playwright with Page Object Model (POM) design pattern.

## Project Structure

```
AIAutomationTesting/
├── tests/                          # Test specifications
│   ├── login/
│   │   └── login.spec.ts           # Login test cases (data-driven)
│   └── register/
│       ├── register.spec.ts        # Registration test cases (data-driven)
│       └── README.md               # Registration tests documentation
├── pages/                          # Page Object Models
│   ├── LoginPage.ts                # Login page actions & locators
│   └── RegisterPage.ts             # Registration page actions & locators
├── fixtures/                       # Custom test fixtures
│   └── testSetup.ts                # Shared test setup & helpers
├── data/                           # Test data
│   └── testData.json               # Emails, passwords, test configs
├── utils/                          # Utility modules
│   ├── custom-reporter.js          # HTML report generator with filtering
│   ├── HTMLReportGenerator.js      # Report generation helper
│   ├── websocket-reporter.js       # Real-time log streaming
│   ├── emailGenerator.ts           # Email generation for registration
│   ├── inspect-page.js             # Page inspection tool
│   └── inspect-register-page.js    # Register page inspection tool
├── reports/                        # Generated HTML reports
├── public/                         # Web UI dashboard
│   ├── index.html                  # Dashboard interface
│   └── app.js                      # Dashboard JavaScript
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
├── server.js                       # Express server for UI dashboard
└── package.json                    # Project dependencies
```

## Features

- **Page Object Model (POM)**: Maintainable and reusable test architecture
- **Data-Driven Testing**: Test 225+ email accounts from centralized JSON file
- **Multi-Browser Support**: Chromium, Firefox, Microsoft Edge
- **Custom HTML Reports**: Interactive reports with clickable filtering (Total/Passed/Failed)
- **Screenshot Capture**: JPEG screenshots with configurable compression
- **Web UI Dashboard**: Real-time test execution monitoring
- **Parallel Execution**: Run tests concurrently with 3 workers
- **Custom Fixtures**: Reusable test setup with loginPage, testData, screenshotHelper

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AIAutomationTesting
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Command Line

Run all tests (headless mode):
```bash
npx playwright test
```

Run tests with visible browser:
```bash
HEADLESS=false npx playwright test
```

Run specific browser:
```bash
npx playwright test --project chromium
npx playwright test --project firefox
npx playwright test --project edge
```

Run specific email(s):
```bash
TEST_EMAIL="user1@example.com,user2@example.com" npx playwright test
```

Run specific test file:
```bash
npx playwright test tests/login/login.spec.ts
npx playwright test tests/register/register.spec.ts
```

Run registration tests for specific country:
```bash
TEST_COUNTRY="Germany" npx playwright test tests/register
```

Run registration tests for multiple countries:
```bash
TEST_COUNTRY="Germany,France,Spain" npx playwright test tests/register
```

### Web UI Dashboard

1. Start the server:
```bash
node server.js
```

2. Open browser and navigate to:
```
http://localhost:3000
```

3. Select emails, browser, and mode, then click "Run Tests"

## Configuration

### Playwright Config (playwright.config.ts)

| Setting | Description | Default |
|---------|-------------|---------|
| `workers` | Parallel test workers | 3 |
| `actionTimeout` | Timeout per action | 10000ms |
| `retries` | Retry failed tests (CI only) | 2 |
| `baseURL` | Target application URL | UAT environment |

### Browser Configuration

| Browser | Mode | Additional Flags |
|---------|------|------------------|
| Chromium | Isolated context | `--incognito`, `--start-maximized` |
| Firefox | Private browsing | `browser.privatebrowsing.autostart` |
| Edge | InPrivate mode | `--inprivate`, `--start-maximized` |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HEADLESS` | Run browser in headless mode | `true` / `false` |
| `TEST_EMAIL` | Specific email(s) to test | `user@example.com` |

## Test Data

Test data is centralized in `data/testData.json`:

```json
{
  "password": "Password1!",
  "emails": [
    "user1@example.com",
    "user2@example.com"
  ]
}
```

## Page Object Model

### LoginPage (pages/LoginPage.ts)

The LoginPage class encapsulates all login-related actions and locators:

```typescript
// Available methods
loginPage.navigate()                          // Navigate to login page
loginPage.fillEmail(email)                    // Fill email field
loginPage.fillPassword(password)              // Fill password field
loginPage.fillCredentials(email, password)    // Fill both fields
loginPage.clickLogin()                        // Click login button
loginPage.login(email, password)              // Complete login flow
loginPage.waitForLoginSuccess()               // Verify successful login
loginPage.verifyFormElementsVisible()         // Check form elements
loginPage.verifyPageTitle()                   // Verify page title
loginPage.isEmailFieldInvalid()               // Check validation state
loginPage.takeScreenshot(quality)             // Capture screenshot
```

### Locators

| Element | Selector | Description |
|---------|----------|-------------|
| Email field | `#inlineFieldLogin` | Email input field |
| Password field | `#inlineFieldPassword` | Password input field |
| Login button | `button.btn-red.btn-login:has-text("Login")` | Submit button |

## Custom Fixtures

Located in `fixtures/testSetup.ts`:

| Fixture | Description |
|---------|-------------|
| `loginPage` | LoginPage instance for POM methods |
| `testData` | Access to emails, password from JSON |
| `screenshotHelper` | Simplified screenshot attachment |

### Usage in Tests

```typescript
import { test, expect } from '../../fixtures/testSetup';

test('example', async ({ loginPage, screenshotHelper, testData }) => {
  await loginPage.navigate();
  await loginPage.login(testData.emails[0], testData.password);
  await screenshotHelper.attach('dashboard-screenshot');
});
```

## Test Cases

### Login Tests (tests/login/login.spec.ts)

| Test | Description |
|------|-------------|
| `should login successfully with valid credentials [email]` | Data-driven test for 225+ emails |
| `should display login form elements` | Verify form elements visibility |
| `should show validation for empty fields` | Verify HTML5 validation |

### Registration Tests (tests/register/register.spec.ts)

| Test | Description |
|------|-------------|
| `should register successfully with valid data [country]` | Data-driven test for 35 countries with generated emails |
| `should display registration form elements` | Verify form elements visibility |
| `should enable dependent dropdowns after country selection` | Verify dropdowns enable after country selection |

**Email Generation Pattern**: `nickchigg+{CountryName}Test{RandomString}@gmail.com`
- Country names are cleaned (no spaces/symbols)
- Random string: 5 letters (A-Za-z)
- Example: `nickchigg+GermanyTestAbCdE@gmail.com`

**Registration Parameters**:
- Phone: `12341234`
- Password: `Password1!`
- Account Type: `Standard Floating`
- Bonus Scheme: `Not applicable`
- Currency: `USD`
- Leverage: `1:500`

## Reports

### Custom HTML Reports

Reports are generated in the `reports/` folder with:
- **Summary Section**: Total/Passed/Failed/Duration stats
- **Clickable Filters**: Click on Total, Passed, or Failed to filter tests
- **Step-by-Step Details**: Each test step with status indicator
- **Embedded Screenshots**: JPEG compressed screenshots (quality: 30)
- **Color-Coded Status**: Green for passed, red for failed

### Report File Size

Screenshots are compressed to JPEG with quality 30 to minimize report size:
- ~60-80MB for 225 email tests (vs ~350MB with PNG)

### Viewing Reports

Reports are automatically generated after each test run:
```
reports/report_YYYY-MM-DD_HH-MM-SS.html
```

Or access via the Web UI dashboard under "Recent Reports".

## Adding New Tests

### 1. Create a new Page Object (if needed)

```typescript
// pages/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('.welcome-msg');
  }

  async verifyWelcomeMessage(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
  }
}
```

### 2. Add fixture (optional)

```typescript
// fixtures/testSetup.ts
import { DashboardPage } from '../pages/DashboardPage';

// Add to CustomFixtures type
dashboardPage: DashboardPage;

// Add fixture
dashboardPage: async ({ page }, use) => {
  await use(new DashboardPage(page));
}
```

### 3. Create test file

```typescript
// tests/dashboard/dashboard.spec.ts
import { test, expect } from '../../fixtures/testSetup';

test.describe('Dashboard', () => {
  test('should display welcome message', async ({ loginPage, testData }) => {
    await loginPage.navigate();
    await loginPage.login(testData.emails[0], testData.password);
    // Add dashboard verification
  });
});
```

## Utilities

### Page Inspector (utils/inspect-page.js)

Standalone script to inspect page structure and discover selectors:

```bash
node utils/inspect-page.js
```

**Output**:
- Console logs of all input fields and buttons
- Full-page screenshot
- Page source HTML
- Browser stays open for manual inspection

## Troubleshooting

### Tests fail with timeout
- Increase timeout in `playwright.config.ts`
- Check network connectivity to UAT environment
- Verify credentials in `data/testData.json`

### Browser doesn't open in headed mode
- Ensure `HEADLESS=false` is set correctly
- Check browser installation: `npx playwright install`

### Reports are too large
- Screenshot quality is set to 30 (JPEG compression)
- Adjust quality in `pages/LoginPage.ts` or `fixtures/testSetup.ts`

### Web UI logs not showing
- Restart server: `node server.js`
- Check WebSocket connection in browser console

### SSL Certificate errors
- Configuration includes `ignoreHTTPSErrors: true` for UAT environment

## Best Practices

1. **Keep locators in Page Objects** - Never hardcode selectors in tests
2. **Use meaningful test names** - Describe what the test verifies
3. **One assertion per test step** - Makes debugging easier
4. **Centralize test data** - Use `data/testData.json` for all test inputs
5. **Use fixtures for setup** - Avoid repetitive setup code in tests
6. **Run tests in parallel** - Leverage Playwright's parallel execution
7. **Use data-driven testing** - Loop through test data for similar scenarios

## Environment

- **Base URL**: `https://ironfx-com.cp-uat.ironfx.local`
- **Success URL**: `/en/client-portal/home`
- **Page Title**: `Log in to IronFX Client Portal`

## Dependencies

```json
{
  "@playwright/test": "^1.57.0",
  "@types/node": "^25.0.3",
  "express": "^4.x",
  "ws": "^8.x"
}
```

## License

Internal use only - IronFX QA Team
