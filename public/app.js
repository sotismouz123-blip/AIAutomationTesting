// State
let testsLogin = [];
let testsRegister = [];
let allTests = [];
let selectedTests = [];
let selectedSuites = ['login'];
let emails = [];
let countries = [];
let selectedEmails = [];
let selectedCountries = [];
let ws = null;
let isRunning = false;

// DOM Elements
const loginSuiteCheckbox = document.getElementById('loginSuiteCheckbox');
const registerSuiteCheckbox = document.getElementById('registerSuiteCheckbox');
const emailSelectionGroup = document.getElementById('emailSelectionGroup');
const countrySelectionGroup = document.getElementById('countrySelectionGroup');
const emailSelectTrigger = document.getElementById('emailSelectTrigger');
const emailDropdown = document.getElementById('emailDropdown');
const emailOptions = document.getElementById('emailOptions');
const emailSearch = document.getElementById('emailSearch');
const selectAllEmailsCheckbox = document.getElementById('selectAllEmailsCheckbox');
const selectedEmailsText = document.getElementById('selectedEmailsText');
const countrySelectTrigger = document.getElementById('countrySelectTrigger');
const countryDropdown = document.getElementById('countryDropdown');
const countryOptions = document.getElementById('countryOptions');
const countrySearch = document.getElementById('countrySearch');
const selectAllCountriesCheckbox = document.getElementById('selectAllCountriesCheckbox');
const selectedCountriesText = document.getElementById('selectedCountriesText');
const testSelectionPanel = document.getElementById('testSelectionPanel');
const selectAllTestsBtn = document.getElementById('selectAllTestsBtn');
const deselectAllTestsBtn = document.getElementById('deselectAllTestsBtn');
const runSelectedTestsBtn = document.getElementById('runSelectedTestsBtn');
const runAllTestsBtn = document.getElementById('runAllTestsBtn');
const browserSelect = document.getElementById('browserSelect');
const headlessCheckbox = document.getElementById('headlessCheckbox');
const logsContainer = document.getElementById('logsContainer');
const statusIndicator = document.getElementById('statusIndicator');
const statusIndicatorAll = document.getElementById('statusIndicatorAll');
const selectedTestCount = document.getElementById('selectedTestCount');
const selectedTestType = document.getElementById('selectedTestType');
const selectedBrowser = document.getElementById('selectedBrowser');
const testCountBadge = document.getElementById('testCountBadge');
const reportsList = document.getElementById('reportsList');

// Initialize
async function init() {
  await loadEmails();
  await loadCountries();
  await loadAllTests();
  await loadReports();
  setupEventListeners();
  connectWebSocket();
}

// Load emails from API
async function loadEmails() {
  try {
    const response = await fetch('/api/emails');
    emails = await response.json();
    renderEmailOptions(emails);
  } catch (error) {
    console.error('Failed to load emails:', error);
  }
}

// Load countries from API
async function loadCountries() {
  try {
    const response = await fetch('/api/countries');
    countries = await response.json();
    renderCountryOptions(countries);
  } catch (error) {
    console.error('Failed to load countries:', error);
  }
}

// Render email options
function renderEmailOptions(emailList) {
  emailOptions.innerHTML = '';
  emailList.forEach((email, index) => {
    const option = document.createElement('div');
    option.className = 'select-option';
    option.innerHTML = `
      <input type="checkbox" id="email-${index}" value="${email}">
      <label for="email-${index}">${email}</label>
    `;
    option.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
      }
      updateSelectedEmails();
    });
    emailOptions.appendChild(option);
  });
}

// Render country options
function renderCountryOptions(countryList) {
  countryOptions.innerHTML = '';
  countryList.forEach((country, index) => {
    const option = document.createElement('div');
    option.className = 'select-option';
    option.innerHTML = `
      <input type="checkbox" id="country-${index}" value="${country}">
      <label for="country-${index}">${country}</label>
    `;
    option.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
      }
      updateSelectedCountries();
    });
    countryOptions.appendChild(option);
  });
}

// Update selected emails
function updateSelectedEmails() {
  const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
  selectedEmails = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedEmails.length === 0) {
    selectedEmailsText.textContent = 'Select emails...';
  } else if (selectedEmails.length === 1) {
    selectedEmailsText.innerHTML = `${selectedEmails[0]} <span class="selected-count">1</span>`;
  } else {
    selectedEmailsText.innerHTML = `${selectedEmails.length} emails selected <span class="selected-count">${selectedEmails.length}</span>`;
  }

  selectAllEmailsCheckbox.checked = selectedEmails.length === emails.length;
  selectAllEmailsCheckbox.indeterminate = selectedEmails.length > 0 && selectedEmails.length < emails.length;
}

// Update selected countries
function updateSelectedCountries() {
  const checkboxes = countryOptions.querySelectorAll('input[type="checkbox"]');
  selectedCountries = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedCountries.length === 0) {
    selectedCountriesText.textContent = 'Select countries...';
  } else if (selectedCountries.length === 1) {
    selectedCountriesText.innerHTML = `${selectedCountries[0]} <span class="selected-count">1</span>`;
  } else {
    selectedCountriesText.innerHTML = `${selectedCountries.length} countries selected <span class="selected-count">${selectedCountries.length}</span>`;
  }

  selectAllCountriesCheckbox.checked = selectedCountries.length === countries.length;
  selectAllCountriesCheckbox.indeterminate = selectedCountries.length > 0 && selectedCountries.length < countries.length;
}

// Search emails
function searchEmails(query) {
  const filtered = emails.filter(email =>
    email.toLowerCase().includes(query.toLowerCase())
  );
  renderEmailOptions(filtered);

  const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = selectedEmails.includes(cb.value);
  });
}

// Search countries
function searchCountries(query) {
  const filtered = countries.filter(country =>
    country.toLowerCase().includes(query.toLowerCase())
  );
  renderCountryOptions(filtered);

  const checkboxes = countryOptions.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = selectedCountries.includes(cb.value);
  });
}

// Load tests from both suites
async function loadAllTests() {
  try {
    const loginResponse = await fetch('/api/tests?type=login');
    const registerResponse = await fetch('/api/tests?type=register');

    testsLogin = await loginResponse.json();
    testsRegister = await registerResponse.json();

    updateAvailableTests();
  } catch (error) {
    console.error('Failed to load tests:', error);
  }
}

// Update available tests based on selected suites
function updateAvailableTests() {
  selectedSuites = [];
  if (loginSuiteCheckbox.checked) selectedSuites.push('login');
  if (registerSuiteCheckbox.checked) selectedSuites.push('register');

  allTests = [];

  if (selectedSuites.includes('login')) {
    allTests = allTests.concat(testsLogin.map(t => ({...t, suite: 'login'})));
  }
  if (selectedSuites.includes('register')) {
    allTests = allTests.concat(testsRegister.map(t => ({...t, suite: 'register'})));
  }

  selectedTests = [];
  renderTests();
  updateSuitesDisplay();
  updateSelectionGroupsVisibility();
}

// Update visibility of email/country selection groups
function updateSelectionGroupsVisibility() {
  emailSelectionGroup.style.display = selectedSuites.includes('login') ? 'block' : 'none';
  countrySelectionGroup.style.display = selectedSuites.includes('register') ? 'block' : 'none';
}

// Render test selection checkboxes
function renderTests() {
  testSelectionPanel.innerHTML = '';

  if (allTests.length === 0) {
    testSelectionPanel.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Select at least one test suite</div>';
    return;
  }

  const groupedTests = {};
  allTests.forEach(test => {
    if (!groupedTests[test.suite]) {
      groupedTests[test.suite] = [];
    }
    groupedTests[test.suite].push(test);
  });

  Object.entries(groupedTests).forEach(([suite, tests]) => {
    const suiteHeader = document.createElement('div');
    suiteHeader.style.cssText = 'padding: 8px 10px; font-weight: 600; color: #667eea; text-transform: uppercase; font-size: 11px; margin-top: 10px; border-bottom: 1px solid #ddd;';
    suiteHeader.textContent = suite === 'login' ? 'Login Tests' : 'Registration Tests';
    testSelectionPanel.appendChild(suiteHeader);

    tests.forEach((test, index) => {
      const testDiv = document.createElement('div');
      testDiv.className = 'test-item';
      testDiv.innerHTML = `
        <input type="checkbox" id="test-${suite}-${index}" value="${test.name}" data-suite="${test.suite}">
        <label for="test-${suite}-${index}">${test.title}</label>
      `;
      testDiv.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          const checkbox = testDiv.querySelector('input[type="checkbox"]');
          checkbox.checked = !checkbox.checked;
        }
        updateSelectedTests();
      });
      testSelectionPanel.appendChild(testDiv);
    });
  });
}

// Update selected tests
function updateSelectedTests() {
  const checkboxes = testSelectionPanel.querySelectorAll('input[type="checkbox"]');
  selectedTests = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => ({
      name: cb.value,
      suite: cb.dataset.suite
    }));

  selectedTestCount.textContent = selectedTests.length;
  runSelectedTestsBtn.disabled = selectedTests.length === 0;

  if (selectedTests.length === 0) {
    testCountBadge.textContent = '0 tests selected';
  } else {
    testCountBadge.textContent = `${selectedTests.length} test${selectedTests.length === 1 ? '' : 's'} selected`;
  }
}

// Update suites display in stats
function updateSuitesDisplay() {
  const suiteNames = [];
  if (loginSuiteCheckbox.checked) suiteNames.push('Login');
  if (registerSuiteCheckbox.checked) suiteNames.push('Register');

  selectedTestType.textContent = suiteNames.join(' + ') || 'None';
}

// Load reports from API
async function loadReports() {
  try {
    const response = await fetch('/api/reports');
    const reports = await response.json();
    renderReports(reports);
  } catch (error) {
    console.error('Failed to load reports:', error);
  }
}

// Render reports
function renderReports(reports) {
  if (reports.length === 0) {
    reportsList.innerHTML = '<div style="color: #888; font-size: 14px;">No reports yet</div>';
    return;
  }

  reportsList.innerHTML = reports.slice(0, 5).map(report => `
    <div class="report-item">
      <a href="${report.path}" target="_blank">${report.name}</a>
      <div class="report-date">${new Date(report.created).toLocaleString()}</div>
    </div>
  `).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Suite selection change
  loginSuiteCheckbox.addEventListener('change', () => {
    updateAvailableTests();
  });

  registerSuiteCheckbox.addEventListener('change', () => {
    updateAvailableTests();
  });

  // Email dropdown toggle
  emailSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    emailDropdown.classList.toggle('active');
  });

  // Country dropdown toggle
  countrySelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    countryDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!emailDropdown.contains(e.target) && e.target !== emailSelectTrigger) {
      emailDropdown.classList.remove('active');
    }
    if (!countryDropdown.contains(e.target) && e.target !== countrySelectTrigger) {
      countryDropdown.classList.remove('active');
    }
  });

  // Search emails
  emailSearch.addEventListener('input', (e) => {
    searchEmails(e.target.value);
  });

  // Search countries
  countrySearch.addEventListener('input', (e) => {
    searchCountries(e.target.value);
  });

  // Select all emails
  selectAllEmailsCheckbox.addEventListener('change', (e) => {
    const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectedEmails();
  });

  // Select all countries
  selectAllCountriesCheckbox.addEventListener('change', (e) => {
    const checkboxes = countryOptions.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectedCountries();
  });

  // Select all tests
  selectAllTestsBtn.addEventListener('click', () => {
    const checkboxes = testSelectionPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
    updateSelectedTests();
  });

  // Deselect all tests
  deselectAllTestsBtn.addEventListener('click', () => {
    const checkboxes = testSelectionPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateSelectedTests();
  });

  // Browser change
  browserSelect.addEventListener('change', (e) => {
    selectedBrowser.textContent = e.target.options[e.target.selectedIndex].text;
  });

  // Run selected tests
  runSelectedTestsBtn.addEventListener('click', () => {
    if (selectedTests.length > 0) {
      runTests(selectedTests);
    }
  });

  // Run all tests
  runAllTestsBtn.addEventListener('click', () => {
    const allTestsToRun = allTests.map(t => ({
      name: t.name,
      suite: t.suite
    }));
    runTests(allTestsToRun);
  });
}

// Connect to WebSocket
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onopen = () => {
    console.log('WebSocket connected');
    addLog('info', '🔌 Connected to test server');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'LOG') {
      addLog(data.level, data.message);
    } else if (data.type === 'COMPLETE') {
      addLog(data.level, data.message);
      setRunning(false);
      setTimeout(() => loadReports(), 1000);
    } else if (data.type === 'TEST_STATUS') {
      addLog(data.status === 'PASS' ? 'success' : 'error', `${data.testName}: ${data.status}`);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    addLog('error', '❌ Disconnected from server');
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    addLog('error', '❌ WebSocket error occurred');
  };
}

// Run tests
function runTests(testsToRun) {
  if (isRunning) return;

  // Validate selections
  if (selectedSuites.includes('login') && selectedEmails.length === 0) {
    alert('Please select at least one email for login tests');
    return;
  }

  if (selectedSuites.includes('register') && selectedCountries.length === 0) {
    alert('Please select at least one country for registration tests');
    return;
  }

  logsContainer.innerHTML = '';

  const payload = {
    type: 'RUN_TESTS',
    tests: testsToRun,
    emails: selectedEmails,
    countries: selectedCountries,
    browser: browserSelect.value,
    headless: headlessCheckbox.checked
  };

  ws.send(JSON.stringify(payload));
  setRunning(true);
}

// Set running state
function setRunning(running) {
  isRunning = running;
  runSelectedTestsBtn.disabled = running || selectedTests.length === 0;
  runAllTestsBtn.disabled = running;
  loginSuiteCheckbox.disabled = running;
  registerSuiteCheckbox.disabled = running;
  emailSelectTrigger.style.pointerEvents = running ? 'none' : 'auto';
  countrySelectTrigger.style.pointerEvents = running ? 'none' : 'auto';
  browserSelect.disabled = running;
  headlessCheckbox.disabled = running;
  selectAllTestsBtn.disabled = running;
  deselectAllTestsBtn.disabled = running;

  if (running) {
    statusIndicator.className = 'status-indicator running';
    statusIndicatorAll.className = 'status-indicator running';
    runSelectedTestsBtn.innerHTML = '<span class="status-indicator running"></span>Running...';
    runAllTestsBtn.innerHTML = '<span class="status-indicator running"></span>Running...';
  } else {
    statusIndicator.className = 'status-indicator idle';
    statusIndicatorAll.className = 'status-indicator idle';
    runSelectedTestsBtn.innerHTML = '<span class="status-indicator idle"></span>Run Selected';
    runAllTestsBtn.innerHTML = '<span class="status-indicator idle"></span>Run All';
  }
}

// Add log entry
function addLog(level, message) {
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${level}`;

  const timestamp = new Date().toLocaleTimeString();
  logEntry.textContent = `[${timestamp}] ${message}`;

  logsContainer.appendChild(logEntry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Initialize app
init();
