// State
let emails = [];
let selectedEmails = [];
let ws = null;
let isRunning = false;

// DOM Elements
const emailSelectTrigger = document.getElementById('emailSelectTrigger');
const emailDropdown = document.getElementById('emailDropdown');
const emailOptions = document.getElementById('emailOptions');
const emailSearch = document.getElementById('emailSearch');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const selectedEmailsText = document.getElementById('selectedEmailsText');
const browserSelect = document.getElementById('browserSelect');
const headlessCheckbox = document.getElementById('headlessCheckbox');
const runTestsBtn = document.getElementById('runTestsBtn');
const logsContainer = document.getElementById('logsContainer');
const statusIndicator = document.getElementById('statusIndicator');
const selectedCount = document.getElementById('selectedCount');
const selectedBrowser = document.getElementById('selectedBrowser');
const selectedMode = document.getElementById('selectedMode');
const reportsList = document.getElementById('reportsList');

// Initialize
async function init() {
  await loadEmails();
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

// Update selected emails
function updateSelectedEmails() {
  const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
  selectedEmails = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // Update UI
  if (selectedEmails.length === 0) {
    selectedEmailsText.textContent = 'Select emails...';
  } else if (selectedEmails.length === 1) {
    selectedEmailsText.innerHTML = `${selectedEmails[0]} <span class="selected-count">1</span>`;
  } else {
    selectedEmailsText.innerHTML = `${selectedEmails.length} emails selected <span class="selected-count">${selectedEmails.length}</span>`;
  }

  selectedCount.textContent = selectedEmails.length;

  // Update select all checkbox
  selectAllCheckbox.checked = selectedEmails.length === emails.length;
  selectAllCheckbox.indeterminate = selectedEmails.length > 0 && selectedEmails.length < emails.length;
}

// Search emails
function searchEmails(query) {
  const filtered = emails.filter(email =>
    email.toLowerCase().includes(query.toLowerCase())
  );
  renderEmailOptions(filtered);

  // Restore selections
  const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = selectedEmails.includes(cb.value);
  });
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
  // Email dropdown toggle
  emailSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    emailDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!emailDropdown.contains(e.target) && e.target !== emailSelectTrigger) {
      emailDropdown.classList.remove('active');
    }
  });

  // Search emails
  emailSearch.addEventListener('input', (e) => {
    searchEmails(e.target.value);
  });

  // Select all
  selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = emailOptions.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectedEmails();
  });

  // Browser change
  browserSelect.addEventListener('change', (e) => {
    selectedBrowser.textContent = e.target.options[e.target.selectedIndex].text;
  });

  // Headless mode change
  headlessCheckbox.addEventListener('change', (e) => {
    selectedMode.textContent = e.target.checked ? 'Headless' : 'Headed';
  });

  // Run tests button
  runTestsBtn.addEventListener('click', runTests);
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
      // Reload reports
      setTimeout(() => loadReports(), 1000);
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
function runTests() {
  if (isRunning) return;

  if (selectedEmails.length === 0) {
    alert('Please select at least one email');
    return;
  }

  // Clear logs
  logsContainer.innerHTML = '';

  // Send command to server
  const payload = {
    type: 'RUN_TESTS',
    selectedEmails: selectedEmails,
    browser: browserSelect.value,
    headless: headlessCheckbox.checked
  };

  ws.send(JSON.stringify(payload));
  setRunning(true);
}

// Set running state
function setRunning(running) {
  isRunning = running;
  runTestsBtn.disabled = running;

  if (running) {
    statusIndicator.className = 'status-indicator running';
    runTestsBtn.textContent = 'Running Tests...';
  } else {
    statusIndicator.className = 'status-indicator idle';
    runTestsBtn.innerHTML = '<span class="status-indicator idle" id="statusIndicator"></span>Run Tests';
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
