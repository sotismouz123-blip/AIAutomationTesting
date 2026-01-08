# Profile Update Success Verification Test

## Overview

This automation test implements **TC_PROFILE_UPDATE_SUCCESS_001**, a comprehensive end-to-end test that verifies the complete profile update flow:

1. **Register** a new account
2. **Login** with newly created credentials
3. **Navigate** to the Profile Page
4. **Fill** all profile form fields
5. **Submit** the profile update and verify success

## Test Structure

### Files Created

```
pages/
├── ProfilePage.ts              # Profile page object model

tests/
└── profile/
    └── profile-success-verification.spec.ts    # Main test file

TEST_CASE_DOCS/
└── SUCCESS_VERIFICATION_TEST_CASE.md           # Detailed test case documentation
```

## Test Execution

### Prerequisites

- Node.js installed
- Playwright dependencies installed
- Application accessible at `https://www.ironfx.com`
- Valid test data configured

### Running the Test

**Run the success verification test:**
```bash
npx playwright test tests/profile/profile-success-verification.spec.ts --project chromium
```

**Run with specific reporter:**
```bash
npx playwright test tests/profile/profile-success-verification.spec.ts --reporter=html
```

**Run in headed mode (see browser):**
```bash
npx playwright test tests/profile/profile-success-verification.spec.ts --headed
```

**Run in debug mode:**
```bash
npx playwright test tests/profile/profile-success-verification.spec.ts --debug
```

## Test Data

The test uses the following profile data (defined in the test file):

### Personal Information
- **Nationality:** German
- **Gender:** Male
- **Date of Birth:** 15/06/1990
- **Tax Country:** Germany
- **TIN:** 12345678901

### Address Information
- **Address 1:** 123 Main Street
- **Address 2:** Apartment 4B
- **Town:** Berlin
- **Postcode:** 10115
- **Country of Residence:** Germany

### Contact Information
- **Landline:** +49 3032123456
- **Mobile:** +49 1501234567

### Employment Information
- **Employment Status:** Employed
- **Nature of Business:** Finance

### Financial Information
- **Source of Funds:** Salary
- **Expected Deposit:** 5000-10000
- **Annual Income:** 50000-100000
- **Net Worth:** 100000-500000

### Experience Information
- **Seminar Experience:** Yes (Advanced)
- **Work Experience:** Yes

### Frequency & Volume
- **Frequency:** Daily
- **Volume:** High

## ProfilePage Object Methods

### Navigation
```typescript
await profilePage.navigate()
```
Navigates to the profile page URL.

### Verification
```typescript
await profilePage.verifyProfileFieldsVisible()
```
Verifies all required fields are visible and interactive.

```typescript
await profilePage.verifyNoErrors()
```
Verifies no error messages are displayed on the page.

### Form Filling Methods

**Personal Information:**
```typescript
await profilePage.fillPersonalInfo(
  nationality: string,
  gender: string,
  dateOfBirth: string,
  taxCountry: string,
  tin: string
)
```

**Address Information:**
```typescript
await profilePage.fillAddressInfo(
  address1: string,
  address2: string,
  town: string,
  postcode: string,
  countryOfResidence: string
)
```

**Phone Information:**
```typescript
await profilePage.fillPhoneInfo(
  landlinePrefix: string,
  landlineNumber: string,
  mobilePrefix: string,
  mobileNumber: string
)
```

**Employment Information:**
```typescript
await profilePage.fillEmploymentInfo(
  employmentStatus: string,
  natureOfBusiness: string
)
```

**Financial Information:**
```typescript
await profilePage.fillFinancialInfo(
  sourceOfFunds: string,
  expectedDeposit: string,
  annualIncome: string,
  netWorth: string
)
```

**Experience Information:**
```typescript
await profilePage.fillExperienceInfo(
  hasSeminarExperience: boolean,
  seminarExperienceType?: string,
  hasWorkExperience?: boolean
)
```

**Frequency & Volume:**
```typescript
await profilePage.fillFrequencyAndVolume(
  frequencyValue: string,
  volumeValue: string
)
```

### Form Submission
```typescript
await profilePage.clickUpdate()
```
Clicks the Update button to submit the profile form.

### Complete Update
```typescript
await profilePage.completeProfileUpdate(profileData: any)
```
Comprehensive method that fills all sections in order and submits the form.

## Test Execution Flow

### Step 1: Registration (3-4 seconds)
- Navigate to registration page
- Select country
- Enter personal information
- Set passwords
- Configure trading account settings
- Submit registration form

### Step 2: Login (2-3 seconds)
- Navigate to login page
- Enter email and password
- Click login button
- Verify authentication successful

### Step 3: Profile Navigation (1-2 seconds)
- Navigate to profile page URL
- Verify page loads successfully

### Step 4: Field Verification (1 second)
- Verify all profile fields are visible
- Verify all fields are interactive

### Step 5-11: Form Population (10-15 seconds)
- Fill personal information (5 fields)
- Fill address information (5 fields)
- Fill phone information (4 fields)
- Fill employment information (2 fields)
- Fill financial information (4 fields)
- Fill experience information (3 fields)
- Fill frequency and volume (2 field groups)

### Step 12: Submission (2-3 seconds)
- Click Update button
- Verify no error messages
- Verify successful submission

**Total Test Duration:** ~30-35 seconds

## Output and Reporting

### Screenshots
The test automatically captures screenshots at key points:
- After page navigation
- After form submission
- Upon completion

Screenshots are saved in: `test-results/`

### Console Output
Detailed step-by-step logging output showing:
- Current step being executed
- Field values being entered
- Success/failure status
- Final test summary

Example output:
```
═══════════════════════════════════════════════════════════
  TC_PROFILE_UPDATE_SUCCESS_001: Profile Update Success Test
═══════════════════════════════════════════════════════════

📝 STEP 1: REGISTER NEW ACCOUNT
─────────────────────────────────────────────────────────
✓ Country selected: Germany
✓ Personal info filled: John TestUser
✓ Email: john.testuser+1673180400123@gmail.com
✓ Passwords filled
✓ Trading settings: Standard Floating, USD
✓ Account registered successfully
✅ STEP 1 COMPLETE: Account registered successfully
...
```

### HTML Report
Run with `--reporter=html` to generate a detailed HTML report:
```bash
npx playwright test tests/profile/profile-success-verification.spec.ts --reporter=html
npx playwright show-report
```

## Error Handling

The test includes automatic error detection for:
- Form field visibility failures
- Dropdown selection failures
- Text input validation errors
- Profile submission errors
- Authentication failures
- Navigation failures

If any step fails, the test:
1. Captures a screenshot showing the failure
2. Logs detailed error information
3. Stops execution with a clear error message
4. Provides video recording for debugging (if configured)

## Customization

### Changing Test Data

Edit the `profileData` object in `profile-success-verification.spec.ts`:

```typescript
const profileData = {
  nationality: 'German',  // Change here
  gender: 'Male',         // Change here
  dateOfBirth: '15/06/1990',  // Change here
  // ... etc
};
```

### Changing Test Country

Modify the `testCountry` variable:

```typescript
const testCountry = 'Germany';  // Change to any available country
```

### Using Environment Variable

You can pass the country via environment variable:

```bash
TEST_COUNTRY=France npx playwright test tests/profile/profile-success-verification.spec.ts
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Profile Success Verification Test
  run: |
    npx playwright test tests/profile/profile-success-verification.spec.ts \
      --reporter=html \
      --project=chromium
```

### Jenkins Pipeline Example

```groovy
stage('Profile Tests') {
  steps {
    sh 'npx playwright test tests/profile/profile-success-verification.spec.ts'
    publishHTML([
      reportDir: 'playwright-report',
      reportFiles: 'index.html',
      reportName: 'Playwright Report'
    ])
  }
}
```

## Troubleshooting

### Test Fails at Registration
- Verify the registration page is functional
- Check if test email pattern is valid
- Ensure country selection is working
- Check network connectivity

### Test Fails at Login
- Verify login credentials are correct
- Check if login page is loading
- Ensure database is accessible
- Check for authentication service issues

### Test Fails at Profile Page
- Verify profile page URL is correct
- Check if user has permission to access profile
- Ensure profile form is fully loaded
- Check for missing form elements

### Dropdown Selection Fails
- Verify dropdown options exist
- Check if dropdown values match exactly
- Ensure dropdown is visible before selection
- Check for dynamic content loading delays

### Form Submission Fails
- Verify all required fields are filled
- Check validation error messages
- Ensure Update button is clickable
- Check network connectivity

## Test Case Documentation

See [SUCCESS_VERIFICATION_TEST_CASE.md](TEST_CASE_DOCS/SUCCESS_VERIFICATION_TEST_CASE.md) for:
- Complete test case specification
- Detailed step-by-step instructions
- Expected results for each step
- Test data requirements
- Success criteria

## Related Tests

- `tests/register/register.spec.ts` - Registration tests
- `tests/login/login.spec.ts` - Login tests
- `tests/profile/` - Other profile-related tests

## Support

For issues or questions:
1. Check the test output and screenshots in `test-results/`
2. Review the console logs for detailed error information
3. Check the [SUCCESS_VERIFICATION_TEST_CASE.md](TEST_CASE_DOCS/SUCCESS_VERIFICATION_TEST_CASE.md) documentation
4. Verify all prerequisites are met
5. Review the Playwright documentation for advanced debugging

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-08 | Initial test case and automation code created |

---

**Test Framework:** Playwright with TypeScript
**Browser Support:** Chromium, Firefox, WebKit
**Minimum Node.js Version:** 14.0.0
**Status:** ✅ Ready for Use
