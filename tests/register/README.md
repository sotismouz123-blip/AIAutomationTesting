# Registration Tests

Automated tests for IronFX Client Portal registration functionality with data-driven testing across multiple countries.

## Test Structure

### Test File
`tests/register/register.spec.ts`

### Page Object
`pages/RegisterPage.ts` - Contains all registration page locators and methods

### Utilities
`utils/emailGenerator.ts` - Generates unique emails based on country names

## Test Cases

### 1. Data-Driven Registration Tests
**Purpose**: Test registration flow for multiple countries with unique generated emails

**Test Pattern**: `should register successfully with valid data [Country]`

**Data Generation**:
- **Email Pattern**: `nickchigg+{CountryName}Test{RandomString}@gmail.com`
  - Example: `nickchigg+GermanyTestAbCdE@gmail.com`
  - Country names are cleaned (spaces and symbols removed)
  - Random string: 5 random letters (A-Za-z)

- **Name Generation**:
  - First Name: `Test{3 random letters}`
  - Last Name: `User{2 random letters}`

**Steps**:
1. Navigate to registration page
2. Select country from dropdown
3. Fill personal information (firstName, lastName, email, phone)
4. Fill password fields
5. Configure trading account settings:
   - Account Type: `Standard Floating`
   - Bonus Scheme: `Not applicable`
   - Currency: `USD`
   - Leverage: `1:500`
6. Submit registration form
7. Capture screenshots at key points

**Countries Tested**: 35 countries (configurable in `data/testData.json`)

### 2. Form Elements Visibility Test
**Purpose**: Verify all registration form elements are visible and accessible

**Steps**:
1. Navigate to registration page
2. Verify form elements are visible

### 3. Dependent Dropdowns Test
**Purpose**: Ensure dependent dropdowns (account type, currency, etc.) are enabled after country selection

**Steps**:
1. Navigate to registration page
2. Select a country
3. Verify dependent dropdowns become enabled

## Configuration

### Registration Defaults (`data/testData.json`)

```json
{
  "registrationDefaults": {
    "phoneNumber": "12341234",
    "password": "Password1!",
    "accountType": "Standard Floating",
    "bonusScheme": "Not applicable",
    "currency": "USD",
    "leverage": "1:500"
  }
}
```

### Countries List

35 countries are configured for testing. See `data/testData.json` for the complete list.

## Running Tests

### Run all registration tests
```bash
npx playwright test tests/register
```

### Run for specific country
```bash
TEST_COUNTRY="Germany" npx playwright test tests/register
```

### Run for multiple countries
```bash
TEST_COUNTRY="Germany,France,Spain" npx playwright test tests/register
```

### Run specific browser
```bash
npx playwright test tests/register --project chromium
```

### Run with visible browser
```bash
HEADLESS=false npx playwright test tests/register
```

## Email Generator

### Usage

```typescript
import { generateEmailForCountry, generateRegistrationData } from '../../utils/emailGenerator';

// Generate just email
const email = generateEmailForCountry("United States");
// => "nickchigg+UnitedStatesTestAbCdE@gmail.com"

// Generate complete registration data
const data = generateRegistrationData("Germany", {
  phoneNumber: "12341234",
  password: "Password1!",
  accountType: "Standard Floating",
  bonusScheme: "Not applicable",
  currency: "USD",
  leverage: "1:500"
});
```

### Email Pattern Details

**Base**: `nickchigg+`
**Country**: Cleaned country name (no spaces or symbols)
**Suffix**: `Test` + 5 random letters
**Domain**: `@gmail.com`

**Cleaning Rules**:
- Remove spaces: `"United States"` → `"UnitedStates"`
- Remove dots: `"St. Kitts"` → `"StKitts"`
- Remove hyphens: `"Timor-Leste"` → `"TimorLeste"`
- Remove apostrophes: `"Côte d'Ivoire"` → `"CotedIvoire"`

## RegisterPage Methods

```typescript
// Navigation
await registerPage.navigate()

// Country selection
await registerPage.selectCountry(country)

// Personal information
await registerPage.fillPersonalInfo(firstName, lastName, email, phoneNumber)

// Password
await registerPage.fillPasswords(password)

// Trading settings
await registerPage.selectTradingSettings(accountType, bonusScheme, currency, leverage)

// Submit
await registerPage.clickSubmit()

// Complete flow
await registerPage.register({
  country, firstName, lastName, email, phoneNumber,
  password, accountType, bonusScheme, currency, leverage
})
```

## Test Execution

**Total Tests**: 111 (35 countries × 3 browsers + 2 additional tests × 3 browsers)

**Parallel Execution**: Tests run in parallel with 3 workers

**Duration**: Approximately 10-15 minutes for all countries and browsers

## Screenshots

Screenshots are captured at:
1. After country selection
2. After form completion
3. After form submission

All screenshots use JPEG compression (quality: 30) to minimize report size.

## Troubleshooting

### Country-specific dropdown issues
- Some countries may have different available options for account types or currencies
- Tests wait 1 second after country selection for dropdowns to populate
- Adjust wait time in `RegisterPage.ts` if needed

### Email format validation
- The email generator ensures clean country names
- All special characters are removed automatically

### Timeout issues
- Registration page may load slowly in some environments
- Increase timeout in `playwright.config.ts` if needed

## Best Practices

1. **Run subset of countries for quick testing**:
   ```bash
   TEST_COUNTRY="Germany,France" npx playwright test tests/register
   ```

2. **Use headless mode for CI/CD**:
   ```bash
   npx playwright test tests/register  # Headless by default
   ```

3. **Monitor generated emails**:
   - Check console output for generated email addresses
   - Useful for debugging and verification

4. **Verify country availability**:
   - Not all countries may be available in the UAT environment
   - Update `countries` list in `testData.json` as needed
