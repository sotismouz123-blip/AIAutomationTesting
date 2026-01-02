# IronFX Login Test Automation

Automated test suite for IronFX Client Portal login functionality using Playwright and TypeScript.

## Project Status

✅ **All 3 tests passing** | 🕒 Execution time: ~28s | 📊 Test Coverage: Login Flow, UI Elements, Form Validation

## Project Structure

```
AIAutomationTesting/
├── tests/                          # Test files
│   └── login.spec.ts              # Login test suite (3 test cases)
├── screenshots/                    # Test screenshots
│   ├── after-login-click.png      # Post-login verification screenshot
│   └── login-page-screenshot.png  # Initial login page screenshot
├── reports/                        # Custom HTML reports
│   └── test-report.html           # Detailed test execution report
├── utils/                          # Utility scripts
│   └── inspect-page.js            # Page inspection tool for selector discovery
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Test Cases

### 1. Login with Valid Credentials
**Purpose**: Verify successful login flow with valid user credentials

**Steps**:
- Navigate to `/en/client-portal`
- Fill email: `nickchigg+AfghanistanTestDNlbXjDX@gmail.com`
- Fill password: `Password1!`
- Click Login button
- Verify navigation to `/en/client-portal/home`
- Capture screenshot for verification

**Expected Result**: User successfully redirected to dashboard

---

### 2. Display Login Form Elements
**Purpose**: Validate all required login form elements are visible

**Verifications**:
- Email field (`#inlineFieldLogin`) is visible
- Password field (`#inlineFieldPassword`) is visible
- Login button is visible
- Page title contains "Log in to IronFX Client Portal"

**Expected Result**: All form elements render correctly

---

### 3. Form Validation for Empty Fields
**Purpose**: Ensure HTML5 validation prevents empty form submission

**Steps**:
- Navigate to login page
- Click Login button without filling fields
- Verify HTML5 validation triggers

**Expected Result**: Form cannot be submitted; email field marked as invalid

## Configuration

### Playwright Settings
- **Test Directory**: `./tests`
- **Browser**: Chromium (Desktop Chrome)
- **Execution Mode**: Headed (visible browser)
- **SlowMo**: 500ms (for visual debugging)
- **SSL Errors**: Ignored (UAT environment)
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Enabled on retry

### Environment
- **Base URL**: `https://ironfx-com.cp-uat.ironfx.local`
- **Success URL**: `https://ironfx-com.cp-uat.ironfx.local/en/client-portal/home`
- **Page Title**: "Log in to IronFX Client Portal in Seconds. Start Trading Now"

## Running Tests

### Prerequisites
```bash
npm install
```

### Test Execution Commands

```bash
# Run all tests (visible browser)
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode (step-through debugging)
npm run test:debug

# Run tests in UI mode (interactive test runner)
npm run test:ui

# View HTML test report
npm run test:report
```

## Key Selectors

| Element | Selector | Type | Attributes |
|---------|----------|------|------------|
| Email field | `#inlineFieldLogin` | Input | type="email", name="login" |
| Password field | `#inlineFieldPassword` | Input | type="password", name="password" |
| Login button | `button.btn-red.btn-login:has-text("Login")` | Button | Main submit button |

## Utilities

### Page Inspector (`utils/inspect-page.js`)
Standalone script to inspect page structure and discover selectors.

**Usage**:
```bash
node utils/inspect-page.js
```

**Output**:
- Console logs of all input fields and buttons
- Full-page screenshot: `login-page-screenshot.png`
- Page source HTML: `page-source.html`
- Browser stays open for 60 seconds for manual inspection

## Reports

### Custom HTML Report
Located at `reports/test-report.html`

**Features**:
- Professional dashboard with execution summary
- Detailed test steps with timestamps
- Screenshots for login page and dashboard
- Console logs
- Execution timeline
- Test statistics

### Playwright HTML Report
Generated automatically in `playwright-report/`

**View Report**:
```bash
npm run test:report
```

## Technical Notes

### SSL Certificate Handling
The UAT environment uses self-signed certificates. The configuration includes `ignoreHTTPSErrors: true` to allow testing.

### Multiple Login Buttons
The page contains multiple "Continue" buttons (some hidden for 2FA flows). The correct selector targets the visible red Login button specifically.

### Headed Mode
Tests run with visible browser (`headless: false`) and 500ms slowMo for easy debugging and demonstration purposes.

### Screenshot Strategy
- Manual screenshots saved to `screenshots/` folder
- Automatic failure screenshots saved to `test-results/`
- Full-page screenshots for comprehensive verification

## Test Credentials

**Email**: `nickchigg+AfghanistanTestDNlbXjDX@gmail.com`
**Password**: `Password1!`

⚠️ **Note**: These are UAT environment test credentials only.

## Dependencies

```json
{
  "@playwright/test": "^1.57.0",
  "@types/node": "^25.0.3"
}
```

## Browser Support

Currently configured for **Chromium** only. To add additional browsers, update `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## Troubleshooting

### Tests failing with SSL errors
Ensure `ignoreHTTPSErrors: true` is set in `playwright.config.ts`

### Cannot find selectors
Run the page inspector utility to discover current selectors:
```bash
node utils/inspect-page.js
```

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 20000, // Increase from 10000
}
```

## Contributing

When adding new tests:
1. Place test files in `tests/` folder
2. Use descriptive test names
3. Add screenshots to `screenshots/` folder
4. Update this README with new test cases
5. Follow existing selector patterns

## License

ISC
