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

// Load emails and test data
const emails = require('./test-emails.js');
const testData = require('./data/testData.json');

// API endpoint to get all emails
app.get('/api/emails', (req, res) => {
  res.json(emails);
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

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'RUN_TESTS') {
        const { testType, selectedItems, browser, headless } = data;

        // Determine test path and environment variable based on test type
        let testPath = '';
        const env = { ...process.env };

        if (testType === 'login') {
          testPath = 'tests/login';
          const selectedEmails = selectedItems || [];

          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Starting LOGIN tests with ${selectedEmails.length} email(s) on ${browser} (${headless ? 'headless' : 'headed'} mode)...`
          }));

          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Selected emails: ${selectedEmails.join(', ')}`
          }));

          // Set selected emails
          if (selectedEmails.length > 0) {
            env.TEST_EMAIL = selectedEmails.join(',');
          }
        } else if (testType === 'register') {
          testPath = 'tests/register';
          const selectedCountries = selectedItems || [];

          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Starting REGISTRATION tests with ${selectedCountries.length} country(ies) on ${browser} (${headless ? 'headless' : 'headed'} mode)...`
          }));

          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `Selected countries: ${selectedCountries.join(', ')}`
          }));

          // Set selected countries
          if (selectedCountries.length > 0) {
            env.TEST_COUNTRY = selectedCountries.join(',');
          }
        }

        ws.send(JSON.stringify({
          type: 'LOG',
          level: 'info',
          message: `Executing: npx playwright test ${testPath} --project ${browser}`
        }));

        // Set headless mode
        env.HEADLESS = headless ? 'true' : 'false';

        // Set browser project and add reporters for better output
        let playwrightArgs = [
          'test',
          testPath,
          '--project', browser,
          '--reporter=line',
          '--reporter=./utils/custom-reporter.js'
        ];

        // Spawn Playwright process
        ws.send(JSON.stringify({
          type: 'LOG',
          level: 'info',
          message: `🚀 Spawning test process...`
        }));

        const testProcess = spawn('npx', ['playwright', ...playwrightArgs], {
          env: {
            ...env,
            FORCE_COLOR: '0',  // Disable colors for cleaner logs
            NODE_ENV: 'test'
          },
          shell: true,
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']  // Explicitly set stdio for better output capture
        });

        testProcess.on('spawn', () => {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'info',
            message: `✓ Test process spawned successfully`
          }));
        });

        // Stream stdout
        testProcess.stdout.setEncoding('utf8');
        testProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('[STDOUT]', output); // Debug: log to server console

          // Split by lines and send each line separately for better formatting
          output.split('\n').forEach(line => {
            if (line.trim()) {
              ws.send(JSON.stringify({
                type: 'LOG',
                level: 'info',
                message: line
              }));
            }
          });
        });

        // Stream stderr (Playwright often sends progress here)
        testProcess.stderr.setEncoding('utf8');
        testProcess.stderr.on('data', (data) => {
          const output = data.toString();
          console.log('[STDERR]', output); // Debug: log to server console

          // Split by lines and send each line separately
          output.split('\n').forEach(line => {
            if (line.trim()) {
              // Determine log level based on content
              let level = 'info';
              if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
                level = 'error';
              } else if (line.toLowerCase().includes('warning')) {
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

        // Handle process completion
        testProcess.on('close', (code) => {
          if (code === 0) {
            ws.send(JSON.stringify({
              type: 'COMPLETE',
              level: 'success',
              message: `✓ Tests completed successfully!`
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'COMPLETE',
              level: 'error',
              message: `✗ Tests failed with exit code ${code}`
            }));
          }
        });

        testProcess.on('error', (error) => {
          ws.send(JSON.stringify({
            type: 'LOG',
            level: 'error',
            message: `Error: ${error.message}`
          }));
        });
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
