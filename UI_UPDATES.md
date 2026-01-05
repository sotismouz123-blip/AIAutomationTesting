# Web UI Updates - Login & Registration Tests

## Overview

The Web UI Dashboard has been updated to support both **Login Tests** and **Registration Tests**. Users can now select the test type and run either test suite from the browser interface.

## What Changed

### 1. Server Updates (`server.js`)

#### New API Endpoint
```javascript
app.get('/api/countries', (req, res) => {
  res.json(testData.countries || []);
});
```
- Returns list of 35 countries for registration tests

#### Updated WebSocket Handler
- Now accepts `testType` parameter ('login' or 'register')
- Routes to correct test path:
  - Login: `tests/login`
  - Register: `tests/register`
- Sets appropriate environment variables:
  - Login: `TEST_EMAIL`
  - Register: `TEST_COUNTRY`

### 2. UI Updates (`public/index.html`)

#### New Test Type Selector
```html
<select id="testTypeSelect">
  <option value="login">Login Tests</option>
  <option value="register">Registration Tests</option>
</select>
```

#### Dual Selection Groups
- **Email Selection** (shown for login tests)
  - 225 email addresses
  - Search functionality
  - Select all option

- **Country Selection** (shown for registration tests)
  - 35 countries
  - Search functionality
  - Select all option

#### Updated Stats Display
- Shows selected test type (Login/Registration)
- Label changes based on selection:
  - "Selected Emails" for login
  - "Selected Countries" for registration

### 3. App Logic Updates (`public/app.js`)

#### New State Variables
```javascript
let countries = [];
let selectedCountries = [];
let currentTestType = 'login';
```

#### New Functions
- `loadCountries()` - Fetches countries from API
- `renderCountryOptions()` - Renders country checkboxes
- `updateSelectedCountries()` - Updates country selection state
- `searchCountries()` - Search/filter countries

#### Test Type Switching
When user selects a test type:
- Shows/hides appropriate selection group
- Updates stat labels
- Updates selected count

#### Updated Test Execution
```javascript
const payload = {
  type: 'RUN_TESTS',
  testType: currentTestType,
  selectedItems: currentTestType === 'login' ? selectedEmails : selectedCountries,
  browser: browserSelect.value,
  headless: headlessCheckbox.checked
};
```

## How to Use

### 1. Start the Server
```bash
node server.js
```

### 2. Open Browser
Navigate to: `http://localhost:3000`

### 3. Select Test Type

#### For Login Tests:
1. Select **"Login Tests"** from Test Type dropdown
2. Email selection will appear
3. Search or select emails
4. Choose browser and mode
5. Click **"Run Tests"**

#### For Registration Tests:
1. Select **"Registration Tests"** from Test Type dropdown
2. Country selection will appear
3. Search or select countries
4. Choose browser and mode
5. Click **"Run Tests"**

## Features

### Login Tests
- **Data**: 225 email addresses
- **Parameters**:
  - Email (selected)
  - Password: `Password1!`
- **Tests per browser**: 225+ tests
- **Environment variable**: `TEST_EMAIL`

### Registration Tests
- **Data**: 35 countries
- **Parameters**:
  - Country (selected)
  - Email: Auto-generated per country
  - Phone: `12341234`
  - Password: `Password1!`
  - Account Type: `Standard Floating`
  - Bonus Scheme: `Not applicable`
  - Currency: `USD`
  - Leverage: `1:500`
- **Tests per browser**: 35+ tests
- **Environment variable**: `TEST_COUNTRY`

### Email Generation for Registration
Pattern: `nickchigg+{CountryName}Test{RandomString}@gmail.com`
- Country names cleaned (no spaces/symbols)
- Random 5-letter string
- Examples:
  - Germany → `nickchigg+GermanyTestAbCdE@gmail.com`
  - United Kingdom → `nickchigg+UnitedKingdomTestXyZaB@gmail.com`

## Real-Time Features

### Live Logs
- Test execution logs stream in real-time
- Color-coded by level:
  - Blue: Info
  - Green: Success
  - Red: Error
  - Orange: Warning

### Progress Tracking
- Shows number of selected items
- Displays current browser and mode
- Updates test type in stats

### Report Access
- Recent reports listed below configuration
- Click to open in new tab
- Auto-refreshes after test completion

## Technical Details

### Browser Support
- Chromium (incognito mode)
- Firefox (private browsing)
- Microsoft Edge (InPrivate mode)

### Test Execution
- Parallel execution with 3 workers
- Real-time log streaming via WebSocket
- Custom HTML reports with screenshots

### File Structure
```
public/
├── index.html    # UI layout with dual selection
├── app.js        # Logic for both test types
server.js         # Backend with dual test support
```

## Testing the UI

### Test Login Flow
1. Open http://localhost:3000
2. Select "Login Tests"
3. Select 2-3 emails
4. Choose Chromium
5. Uncheck "Headless" to see browser
6. Click "Run Tests"
7. Watch logs stream in real-time

### Test Registration Flow
1. Open http://localhost:3000
2. Select "Registration Tests"
3. Select 2-3 countries (e.g., Germany, France)
4. Choose Chromium
5. Uncheck "Headless" to see browser
6. Click "Run Tests"
7. Watch logs stream in real-time

## Expected Output

### Login Tests
```
Starting LOGIN tests with 2 email(s) on chromium (headed mode)...
Selected emails: email1@example.com, email2@example.com
Executing: npx playwright test tests/login --project chromium
✓ Test process spawned successfully
...test output...
✓ Tests completed successfully!
```

### Registration Tests
```
Starting REGISTRATION tests with 2 country(ies) on chromium (headed mode)...
Selected countries: Germany, France
Executing: npx playwright test tests/register --project chromium
✓ Test process spawned successfully
Generated email: nickchigg+GermanyTestAbCdE@gmail.com
Generated email: nickchigg+FranceTestXyZpQ@gmail.com
...test output...
✓ Tests completed successfully!
```

## Troubleshooting

### Server Won't Start
```bash
# Kill any existing server on port 3000
pkill -f "node server.js"

# Start fresh
node server.js
```

### Countries Not Loading
- Check `data/testData.json` has `countries` array
- Verify API endpoint: `http://localhost:3000/api/countries`

### Tests Not Running
- Ensure test files exist:
  - `tests/login/login.spec.ts`
  - `tests/register/register.spec.ts`
- Check console for WebSocket errors

### No Logs Appearing
- Check WebSocket connection in browser console
- Verify server is running
- Restart server and refresh browser

## Summary

The UI now provides a **unified dashboard** for running both Login and Registration tests with:
- ✅ Test type selector
- ✅ Dynamic selection (emails or countries)
- ✅ Real-time log streaming
- ✅ Browser and mode selection
- ✅ Report history
- ✅ Search and filter capabilities
- ✅ Select all functionality

Users can seamlessly switch between test types and run comprehensive test suites with just a few clicks!
