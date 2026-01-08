# IronFX Test Automation Framework

**Playwright-based automated testing suite for IronFX Client Portal**

---

## 🎯 What This Project Does

Tests user registration, login, and profile completion flows across multiple countries and browsers with real-time monitoring via a web dashboard.

---

## 📦 Quick Setup

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific test suite
npx playwright test tests/register
npx playwright test tests/login
npx playwright test tests/profile

# Run for specific country
TEST_COUNTRY=Germany npx playwright test tests/register

# View results
npx playwright show-report
```

---

## 📁 Project Structure

```
AIAutomationTesting/
├── src/
│   ├── pages/              # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   └── ProfilePage.ts
│   ├── tests/              # Test specifications
│   │   ├── login/
│   │   ├── register/
│   │   └── profile/
│   ├── fixtures/           # Test setup
│   ├── utils/              # Utilities & helpers
│   └── data/               # Test data
├── docs/                   # All documentation
├── server.js               # Dashboard server
└── playwright.config.ts    # Test configuration
```

---

## 🧪 Test Suites

| Test | Purpose | Coverage |
|------|---------|----------|
| **Registration** | Register with 35+ countries | Data-driven, form validation |
| **Login** | User authentication | Multiple credentials |
| **Profile** | Complete user profile | 30+ form fields |

---

## 🎛️ Dashboard

Web-based UI for test execution and monitoring:

```bash
npm start
# Open http://localhost:3000
```

**Features:**
- Select & run tests
- Real-time logs
- Test reports
- Browser selection

---

## 🔧 Key Technologies

- **Framework:** Playwright Test
- **Language:** TypeScript
- **Pattern:** Page Object Model
- **Server:** Express.js
- **Reporting:** HTML reports with real-time WebSocket logs

---

## 📋 Test Data

Located in `src/data/testData.json`:
- 35+ countries for registration tests
- Default credentials for login tests
- Account configurations

---

## 🚀 Running Tests

### Basic
```bash
npx playwright test
```

### Specific Browser
```bash
npx playwright test --project chromium
npx playwright test --project firefox
npx playwright test --project webkit
```

### Specific Suite
```bash
npx playwright test tests/register
npx playwright test tests/login
npx playwright test tests/profile
```

### Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

---

## 📊 Reports

Tests generate HTML reports in:
- `playwright-report/` - Standard Playwright report
- `reports/` - Custom reports by test suite

View reports:
```bash
npx playwright show-report
```

---

## 📚 Documentation

All documentation in `/docs/`:
- `docs/README.md` - Full documentation
- `docs/GETTING_STARTED.md` - Quick start
- `docs/tests/` - Test-specific docs
- `docs/guides/` - How-to guides
- `docs/reference/` - Detailed references

---

## 🔐 Page Objects

```typescript
// Example usage
import { LoginPage } from './pages/LoginPage';

const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.fillCredentials(email, password);
await loginPage.clickLogin();
```

**Available Pages:**
- `LoginPage` - Login functionality
- `RegisterPage` - Registration flow
- `ProfilePage` - Profile form completion

---

## 💡 Environment Variables

```bash
TEST_COUNTRY=Germany          # Single country test
TEST_COUNTRY="Germany,France" # Multiple countries
HEADLESS=false                # Headed mode
```

---

## ✅ Test Capabilities

- ✅ Multi-browser testing (Chrome, Firefox, Edge)
- ✅ Data-driven testing (35+ countries)
- ✅ Real-time log monitoring
- ✅ Automatic report generation
- ✅ Page Object Model pattern
- ✅ Cross-platform support

---

## 🛠️ Configuration

**Playwright Config:** `playwright.config.ts`
- 3 browsers configured
- Timeout: 30s per test
- Retry: 0 (no auto-retry)
- Workers: 1 (serial execution)

**TypeScript Config:** `tsconfig.json`
- Target: ES2020
- Module: commonjs

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in config |
| Country not found | Check `src/data/testData.json` |
| Dashboard won't load | Check port 3000 availability |
| Elements not visible | Add wait time or check selectors |

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-test

# Commit changes
git commit -m "feat: add new test case"

# Push and create PR
git push origin feature/new-test
```

---

## 🤝 Contributing

1. Create feature branch
2. Add tests following existing patterns
3. Update documentation in `/docs/`
4. Commit with clear messages
5. Push for review

---

## 📖 Learn More

- **Full Documentation:** See `/docs/README.md`
- **Test Cases:** See `/docs/test-cases/`
- **Test Guides:** See `/docs/tests/`
- **Setup Guide:** See `/docs/guides/SETUP.md`

---

## ✨ Features

- 🌍 Multi-country registration testing
- 📱 Multi-browser support
- 📊 Real-time dashboard monitoring
- 📈 Detailed HTML reports
- 🔄 Data-driven test approach
- ⚡ Fast parallel execution
- 🛡️ Robust page object patterns

---

## 📞 Quick Links

- **Dashboard:** `http://localhost:3000` (when running)
- **Reports:** `./playwright-report/`
- **Documentation:** `./docs/`
- **Test Data:** `./src/data/testData.json`

---

**Status:** ✅ Production Ready
**Last Updated:** January 8, 2026
**Version:** 1.0

