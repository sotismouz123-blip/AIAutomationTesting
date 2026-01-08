# Test Dashboard UI Structure

## Overview

The updated Test Dashboard provides an intuitive interface for selecting and running automated tests with real-time monitoring and unified report generation.

## UI Components

### 1. Test Selection Panel
- **Location:** Left sidebar under "Test Selection" card
- **Features:**
  - Dropdown to select test suite (Login/Registration)
  - Checkbox list showing all available tests
  - Each test displays:
    - Test name (checkbox)
    - Test title/description
  - Scrollable panel with max-height of 300px

### 2. Control Buttons
- **Select All Tests** - Selects all checkboxes in the current suite
- **Deselect All Tests** - Deselects all checkboxes
- **Run Selected** - Executes only selected tests (disabled if none selected)
- **Run All** - Executes all tests in the current suite

### 3. Test Counter Badge
- Located below the control buttons
- Displays count of selected tests
- Format: "N test(s) selected" or "0 tests selected"
- Updates in real-time as checkboxes are toggled

### 4. Execution Options
- **Browser:** Dropdown (Chromium, Firefox, Edge)
- **Mode:** Checkbox for Headless/Headed mode
- Disabled during test execution

### 5. Statistics Panel (Right Card)
Displays real-time execution stats:
- Selected Tests - Count of tests to run
- Test Suite - Current test type
- Browser - Selected browser
All disable during execution

### 6. Logs Container
- Real-time scrolling log display
- Color-coded messages:
  - **Info** (blue): General information
  - **Success** (green): Passed tests
  - **Error** (red): Failures and errors
  - **Warning** (yellow): Warnings
- Auto-scrolls to latest entry

### 7. Recent Reports
- Shows last 5 generated reports
- Clickable links to view full reports
- Date/time of generation

## Test Execution Flow

1. **Select Test Suite**
   - Choose between "Login Tests" or "Registration Tests"
   - Available tests load automatically via API

2. **Select Tests**
   - Check boxes for individual tests
   - Or use "Select All Tests" button
   - Counter shows selected count

3. **Configure Execution**
   - Choose browser (Chromium/Firefox/Edge)
   - Select execution mode (Headless/Headed)

4. **Run Tests**
   - Click "Run Selected" for selected tests
   - Click "Run All" for entire suite
   - Buttons disable during execution
   - Real-time logs appear in Logs Container

5. **View Results**
   - Tests complete and report generates
   - Recent reports list updates
   - Click report link to view unified report

## API Endpoints

### GET /api/tests?type=login|register
Returns available tests for the specified type:
```json
[
  {
    "name": "test-identifier",
    "title": "Test Display Title"
  }
]
```

### GET /api/reports
Returns list of recent reports:
```json
[
  {
    "name": "report_2026-01-06_143022.html",
    "path": "/reports/report_2026-01-06_143022.html",
    "created": "2026-01-06T14:30:22.000Z"
  }
]
```

## WebSocket Messages

### Client → Server
```json
{
  "type": "RUN_TESTS",
  "testType": "login|register",
  "tests": ["test-name-1", "test-name-2"],
  "browser": "chromium|firefox|edge",
  "headless": true|false
}
```

### Server → Client
```json
{
  "type": "LOG",
  "level": "info|success|error|warning",
  "message": "Log message text"
}
```

```json
{
  "type": "COMPLETE",
  "level": "success|error",
  "message": "Completion message"
}
```

## Unified Report Structure

The generated report includes:

### Header Section
- Test Suite name
- Browser used
- Execution mode (Headless/Headed)
- Generation timestamp

### Summary Cards
- **Passed:** Count of passed tests
- **Failed:** Count of failed tests
- **Total:** Total tests executed
- **Duration:** Total execution time

### Test Sections (Collapsible)
Each test has:
- **Collapsed View:** Test name + Status badge + Timestamp
- **Expanded View Contains:**
  - Screenshots (with captions)
  - Execution logs (color-coded)
  - Test output
  - Duration
  - Final status

### Collapsible Behavior
- Sections start collapsed (only title visible)
- Click header to expand/collapse
- Arrow icon rotates to indicate state
- No content visible until expanded

## Available Tests

### Login Tests
1. `login-basic` - Login with valid credentials
2. `login-invalid` - Login with invalid credentials
3. `login-empty` - Login with empty fields

### Registration Tests
1. `data-driven-registration` - Data-driven registration test
2. `form-elements` - Form elements visibility
3. `dependent-dropdowns-country` - Dependent dropdowns after country selection
4. `dependent-dropdowns-account` - Dependent dropdowns after account type selection
5. `bonus-categories` - Bonus categories verification
6. `currencies` - Currency options verification
7. `leverage-values` - Leverage values verification
8. `dropdown-population` - Dropdown population verification
9. `button-redirections` - Button redirections verification

## Sequential Test Execution

When running multiple tests:
1. Tests execute in order shown in UI
2. Each test reports status individually
3. Failures do not stop suite execution
4. All results included in unified report
5. Unified report generated after all tests complete

## Styling Details

- **Color Scheme:** Purple gradient primary buttons (#667eea to #764ba2)
- **Background:** Dark (#000000)
- **Card Background:** White
- **Status Colors:**
  - Success: #81c784 (green)
  - Error: #e57373 (red)
  - Info: #4fc3f7 (blue)
  - Warning: #ffb74d (orange)
- **Responsive:** Works on desktop and tablet
- **Dark Logs:** #1e1e1e background for better readability

## State Management

### isRunning
- `false` - Ready for input
- `true` - Tests executing
- All input controls disable during execution
- Button text changes to "Running..."
- Status indicators animate

### selectedTests
- Array of test identifiers
- Updated when checkboxes change
- Used to filter which tests execute
- Empty array disables "Run Selected" button

### currentTestType
- `'login'` or `'register'`
- Changed via Test Suite dropdown
- Triggers reload of available tests
- Updates statistics label
