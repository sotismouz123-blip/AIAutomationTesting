const express = require('express');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Load test data
const testData = require('./data/testData.json');

// Define available tests
const availableTests = {
  login: [
    { name: 'should login successfully', title: 'Login with valid credentials' },
    { name: 'should display login form elements', title: 'Form elements visibility' },
    { name: 'should show validation for empty fields', title: 'Empty fields validation' },
    { name: 'should redirect to correct URLs', title: 'Button redirections' },
    { name: 'should change language', title: 'Language selector' }
  ],
  register: [
    { name: 'data-driven-registration', title: 'Data-driven registration test' },
    { name: 'form-elements', title: 'Form elements visibility' },
    { name: 'dependent-dropdowns-country', title: 'Dependent dropdowns after country selection' },
    { name: 'dependent-dropdowns-account', title: 'Dependent dropdowns after account type selection' },
    { name: 'bonus-categories', title: 'Bonus categories verification' },
    { name: 'currencies', title: 'Currency options verification' },
    { name: 'leverage-values', title: 'Leverage values verification' },
    { name: 'dropdown-population', title: 'Dropdown population verification' },

  ]
};

// API endpoint to get available tests
app.get('/api/tests', (req, res) => {
  const testType = req.query.type || 'login';
  res.json(availableTests[testType] || []);
});

// API endpoint to get all emails
app.get('/api/emails', (req, res) => {
  res.json(testData.emails);
});

// API endpoint to get all countries
app.get('/api/countries', (req, res) => {
  res.json(testData.countries || []);
});

// API endpoint to get reports list
app.get('/api/reports', (req, res) => {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    return res.json([]);
  }

  const files = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('report_') && file.endsWith('.html'))
    .map(file => ({
      name: file,
      path: `/reports/${file}`,
      created: fs.statSync(path.join(reportsDir, file)).mtime
    }))
    .sort((a, b) => b.created - a.created);

  res.json(files);
});

// Serve reports
app.use('/reports', express.static('reports'));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Test Dashboard running at http://localhost:${PORT}`);
  console.log(`   Open this URL in your browser to run tests\n`);
});

// WebSocket server for real-time logs
const wss = new WebSocketServer({ server });

// Function to run tests for a single suite
function runTestSuite(ws, suite, testNames, emails, countries, browser, headless) {
  return new Promise((resolve) => {
    const testPath = `tests/${suite}`;
    const env = { ...process.env };

    ws.send(JSON.stringify({
      type: 'LOG',
      level: 'info',
      message: `Executing: npx playwright test ${testPath} --project ${browser}`
    }));

    // Set environment variables
    env.HEADLESS = headless ? 'true' : 'false';
    env.SELECTED_BROWSER = browser;
    env.TEST_TYPE = suite;

    // Set selected emails for login tests
    if (suite === 'login' && emails && emails.length > 0) {
      env.TEST_EMAIL = emails.join(',');
    }

    // Set selected countries for registration tests
    if (suite === 'register' && countries && countries.length > 0) {
      env.TEST_COUNTRY = countries.join(',');
    }

    // Build playwright args
    let playwrightArgs = [
      'test',
      testPath,
      '--project', browser,
      '--reporter=line',
      '--reporter=./utils/custom-reporter.js'
    ];

    // If specific tests are selected, add test name filter
    if (testNames.length > 0 && testNames.length < availableTests[suite].length) {
      const testPattern = testNames.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      playwrightArgs.push('--grep', testPattern);
    }

    // Spawn Playwright process
    ws.send(JSON.stringify({
      type: 'LOG',
      level: 'info',
      message: `🚀 Spawning test process for ${suite}...`
    }));

    ws.send(JSON.stringify({
      type: 'LOG',
      level: 'info',
      message: `📋 Command: npx playwright ${playwrightArgs.join(' ')}`
    }));

    ws.send(JSON.stringify({
      type: 'LOG',
      level: 'info',
      message: `🔧 Environment: Browser=${env.SELECTED_BROWSER}, Headless=${env.HEADLESS}, Workers=1`
    }));

    const testProcess = spawn('npx', ['playwright', ...playwrightArgs], {
      env: {
        ...env,
        FORCE_COLOR: '1',
        NODE_ENV: 'test'
      },
      shell: true,
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    testProcess.on('spawn', () => {
      ws.send(JSON.stringify({
        type: 'LOG',
        level: 'info',
        message: `✓ Test process spawned successfully (PID: ${testProcess.pid})`
      }));
    });

    // Stream stdout with detailed logging
    testProcess.stdout.setEncoding('utf8');
    let stdoutBuffer = '';
    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutBuffer += output;
      console.log('[STDOUT]', output);

      // Split by newlines and process
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop(); // Keep incomplete line in buffer

      lines.forEach(line => {
        if (line.trim()) {
          let level = 'info';

          // Detect log level from content
          if (line.includes('✓') || line.includes('PASSED') || line.includes('passed')) {
            level = 'success';
          } else if (line.includes('×') || line.includes('FAILED') || line.includes('failed') || line.includes('Error')) {
            level = 'error';
          } else if (line.includes('⚠') || line.includes('WARNING') || line.includes('warning')) {
            level = 'warning';
          }

          ws.send(JSON.stringify({
            type: 'LOG',
            level: level,
            message: line
          }));
        }
      });
    });

    // Stream stderr with detailed logging
    testProcess.stderr.setEncoding('utf8');
    let stderrBuffer = '';
    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrBuffer += output;
      console.log('[STDERR]', output);

      const lines = stderrBuffer.split('\n');
      stderrBuffer = lines.pop();

      lines.forEach(line => {
        if (line.trim()) {
          let level = 'warning';
          if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
            level = 'error';
          }

          ws.send(JSON.stringify({
            type: 'LOG',
            level: level,
            message: line
          }));
        }
      });
    });

    // Handle process completion
    testProcess.on('close', (code) => {
      if (code === 0) {
        ws.send(JSON.stringify({
          type: 'LOG',
          level: 'success',
          message: `✓ ${suite} tests completed successfully!`
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'LOG',
          level: 'error',
          message: `✗ ${suite} tests failed with exit code ${code}`
        }));
      }
      resolve(code);
    });

    testProcess.on('error', (error) => {
      ws.send(JSON.stringify({
        type: 'LOG',
        level: 'error',
        message: `Error: ${error.message}`
      }));
      resolve(1);
    });
  });
}

// Function to run tests from multiple suites sequentially
async function runTestsSequentially(ws, suites, testsBySuite, emails, countries, browser, headless) {
  let overallCode = 0;
  const reportData = {
    testSuite: suites.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + '),
    browser: browser.charAt(0).toUpperCase() + browser.slice(1),
    executionMode: headless ? 'Headless' : 'Headed',
    timestamp: new Date().toLocaleString(),
    tests: [],
    passedCount: 0,
    failedCount: 0,
    totalCount: 0,
    startTime: Date.now()
  };

  for (const suite of suites) {
    const testNames = testsBySuite[suite];
    ws.send(JSON.stringify({
      type: 'LOG',
      level: 'info',
      message: `\n━━━ Starting ${suite.toUpperCase()} test suite (${testNames.length} test(s)) ━━━`
    }));

    const code = await runTestSuite(ws, suite, testNames, emails, countries, browser, headless);
    if (code !== 0) overallCode = code;

    // Collect test results from JSON report files
    const reportPath = path.join(__dirname, 'reports');
    if (fs.existsSync(reportPath)) {
      const reportFiles = fs.readdirSync(reportPath)
        .filter(f => f.endsWith('.json') && f.includes(`report_${suite}_`))
        .sort()
        .reverse();

      if (reportFiles.length > 0) {
        try {
          const latestReport = JSON.parse(
            fs.readFileSync(path.join(reportPath, reportFiles[0]), 'utf-8')
          );
          if (latestReport.tests && latestReport.tests.length > 0) {
            reportData.tests = reportData.tests.concat(latestReport.tests);

            // Calculate passed/failed from actual test statuses
            const passedTests = latestReport.tests.filter(t => t.status === 'passed').length;
            const failedTests = latestReport.tests.filter(t => t.status === 'failed').length;

            reportData.passedCount += passedTests;
            reportData.failedCount += failedTests;
          } else if (latestReport.stats) {
            // Fallback to stats if tests array is not available
            reportData.passedCount += latestReport.stats.passed || 0;
            reportData.failedCount += latestReport.stats.failed || 0;
          }
        } catch (e) {
          console.error('Error reading report file:', e);
        }
      }
    }
  }

  reportData.totalCount = reportData.tests.length;
  reportData.duration = ((Date.now() - reportData.startTime) / 1000).toFixed(2) + 's';

  ws.send(JSON.stringify({
    type: 'COMPLETE',
    level: overallCode === 0 ? 'success' : 'error',
    message: overallCode === 0 ? `✓ All tests completed successfully! Reports generated.` : `✗ Tests completed with errors. Reports generated.`
  }));
}


wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'RUN_TESTS') {
        const { tests, emails, countries, browser, headless } = data;
        const selectedTests = tests || [];

        // Validate that tests are selected
        if (!selectedTests || selectedTests.length === 0) {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'error',
            message: 'Error: No tests selected'
          }));
          ws.send(JSON.stringify({
            type: 'COMPLETE',
            level: 'error',
            message: 'No tests to run'
          }));
          return;
        }

        // Group tests by suite
        const testsBySuite = {};
        selectedTests.forEach(test => {
          if (test && test.suite) {
            if (!testsBySuite[test.suite]) {
              testsBySuite[test.suite] = [];
            }
            testsBySuite[test.suite].push(test.name);
          }
        });

        const suites = Object.keys(testsBySuite);

        if (suites.length === 0) {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'error',
            message: 'Error: No valid test suites found'
          }));
          ws.send(JSON.stringify({
            type: 'COMPLETE',
            level: 'error',
            message: 'No valid test suites'
          }));
          return;
        }

        ws.send(JSON.stringify({
          type: 'LOG',
          level: 'info',
          message: `Starting tests with ${selectedTests.length} test(s) from ${suites.length} suite(s) on ${browser} (${headless ? 'headless' : 'headed'} mode)...`
        }));

        if (selectedTests.length > 0) {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Selected tests: ${selectedTests.map(t => `${t.name}`).join(', ')}`
          }));
        }

        if (emails && emails.length > 0) {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Selected emails: ${emails.slice(0, 3).join(', ')}${emails.length > 3 ? ` ... and ${emails.length - 3} more` : ''}`
          }));
        }

        if (countries && countries.length > 0) {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Selected countries: ${countries.slice(0, 3).join(', ')}${countries.length > 3 ? ` ... and ${countries.length - 3} more` : ''}`
          }));
        }

        // Run tests for each suite sequentially
        runTestsSequentially(ws, suites, testsBySuite, emails, countries, browser, headless);
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'LOG',
        level: 'error',
        message: `Error: ${error.message}`
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});
