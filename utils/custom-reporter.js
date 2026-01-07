const fs = require('fs');
const path = require('path');

class CustomHTMLReporter {
  constructor() {
    this.tests = [];
    this.startTime = new Date();
  }

  onBegin(config, suite) {
    this.startTime = new Date();
    console.log(`Starting test run with ${suite.allTests().length} tests`);
  }

  generateTestCasesList() {
    const uniqueTests = new Map();

    this.tests.forEach((test, index) => {
      const testName = test.name.split('[')[0];
      if (!uniqueTests.has(testName)) {
        uniqueTests.set(testName, {
          description: test.description,
          index: index
        });
      }
    });

    let listHtml = '<ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8; color: #ddd;">';
    let counter = 1;

    uniqueTests.forEach((data, testName) => {
      const shortDesc = data.description || 'Test validation for IronFX platform';
      const testId = `test-${counter}`;
      listHtml += `<li><a href="#${testId}" class="test-overview-link"><strong>${testName}</strong></a> - ${shortDesc}</li>`;
      counter++;
    });

    listHtml += '</ol>';
    return listHtml;
  }

  onTestEnd(test, result) {
    const testName = test.title;
    const annotations = test.annotations || [];

    let testDescription = '';
    let combinations = [];
    for (const annotation of annotations) {
      if (annotation.type === 'description' && annotation.description) {
        testDescription = annotation.description;
      }
      if (annotation.type === 'combinations' && annotation.description) {
        combinations = annotation.description.split('|').filter(c => c.trim() !== '');
      }
    }

    const steps = result.steps
      .filter(step => !step.title.startsWith('Before Hooks') && !step.title.startsWith('After Hooks'))
      .map((step, index) => {
        const stepData = {
          number: index + 1,
          description: step.title,
          status: step.error ? 'failed' : 'passed',
          screenshots: []
        };

        if (result.attachments) {
          result.attachments.forEach(attachment => {
            if (attachment.contentType === 'image/png' || attachment.contentType === 'image/jpeg') {
              let screenshotData = '';
              const imageType = attachment.contentType === 'image/jpeg' ? 'jpeg' : 'png';

              if (attachment.body) {
                screenshotData = `data:image/${imageType};base64,${attachment.body.toString('base64')}`;
              } else if (attachment.path) {
                const imageBuffer = fs.readFileSync(attachment.path);
                screenshotData = `data:image/${imageType};base64,${imageBuffer.toString('base64')}`;
              }

              if (screenshotData) {
                stepData.screenshots.push({
                  name: attachment.name,
                  data: screenshotData
                });
              }
            }
          });
        }

        return stepData;
      });

    this.tests.push({
      name: testName,
      status: result.status === 'passed' ? 'passed' : 'failed',
      startTime: new Date(result.startTime),
      endTime: new Date(result.startTime + result.duration),
      steps: steps,
      duration: result.duration,
      description: testDescription,
      combinations: combinations
    });
  }

  async onEnd(result) {
    const endTime = new Date();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    const passedTests = this.tests.filter(t => t.status === 'passed').length;
    const failedTests = this.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.tests.length;

    const selectedBrowser = process.env.SELECTED_BROWSER || 'Multiple Browsers';
    const browserMap = {
      'chromium': 'Chromium',
      'firefox': 'Firefox',
      'edge': 'Microsoft Edge'
    };
    const displayBrowser = browserMap[selectedBrowser.toLowerCase()] || selectedBrowser;

    const datetime = new Date().toISOString().replace(/:/g, '-').split('.')[0].replace('T', '_');

    // Detect test suite type from test names
    let testType = 'unknown';
    if (this.tests.length > 0) {
      const firstTestName = this.tests[0].name.toLowerCase();
      if (firstTestName.includes('login')) {
        testType = 'login';
      } else if (firstTestName.includes('register') || firstTestName.includes('registration')) {
        testType = 'register';
      }
    }
    testType = process.env.TEST_TYPE || testType;

    const reportPath = path.join(process.cwd(), 'reports', `report_${testType}_${datetime}.html`);
    const jsonReportPath = path.join(process.cwd(), 'reports', `report_${testType}_${datetime}.json`);

    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>IronFX Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #000000; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .header { background: #1a1a1a; color: white; padding: 30px; border-radius: 8px 8px 0 0; border-bottom: 2px solid #667eea; }
    .header-top { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
    .logo { max-width: 100px; height: auto; }
    .logo img { width: 100%; height: auto; object-fit: contain; }
    .header-text h1 { font-size: 28px; margin-bottom: 10px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .meta { font-size: 14px; opacity: 0.9; color: #ccc; }
    .report-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; font-size: 13px; }
    .info-item { padding: 12px; background: rgba(255,255,255,0.05); border-left: 3px solid #667eea; border-radius: 4px; }
    .info-label { color: #aaa; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; margin-bottom: 5px; }
    .info-value { color: #fff; font-weight: 600; }
    .test-description { background: rgba(102,126,234,0.1); border-left: 3px solid #667eea; padding: 15px; border-radius: 4px; margin-top: 20px; }
    .test-description-title { color: #667eea; font-weight: 600; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; }
    .test-description-content { color: #ddd; font-size: 13px; line-height: 1.6; }
    .test-case-description { background: rgba(102,126,234,0.1); border-left: 3px solid #667eea; padding: 12px; border-radius: 4px; margin-bottom: 15px; font-size: 12px; color: #ccc; line-height: 1.5; }
    .test-overview-link { color: #667eea; cursor: pointer; text-decoration: none; }
    .test-overview-link:hover { text-decoration: underline; }
    .combinations-list { background: rgba(102,126,234,0.05); border-left: 3px solid #667eea; padding: 12px; border-radius: 4px; margin-top: 12px; font-size: 12px; }
    .combinations-title { color: #667eea; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; }
    .combinations-items { color: #ddd; max-height: 300px; overflow-y: auto; }
    .combination-item { padding: 4px 0; border-bottom: 1px solid rgba(102,126,234,0.2); }
    .combination-item:last-child { border-bottom: none; }
    .test { margin-bottom: 15px; border: 2px solid #333; border-radius: 8px; overflow: hidden; }
    .test-collapsed { border: 2px solid #555; }
    .test-header-collapsed { background: #2a2a2a; padding: 20px; border-bottom: none; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.3s; }
    .test-header-collapsed:hover { background: #333; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2); }
    .test-number { color: #667eea; font-weight: 600; margin-right: 15px; min-width: 50px; }
    .test-title-collapsed { color: #fff; font-weight: 500; flex: 1; }
    .test-toggle-icon { color: #667eea; font-size: 20px; font-weight: bold; transition: transform 0.3s; }
    .test-toggle-icon.expanded { transform: rotate(180deg); }
    .test-content { display: none; }
    .test-content.expanded { display: block; }
    .summary { display: flex; padding: 30px; border-bottom: 1px solid #333; gap: 20px; }
    .summary-item { flex: 1; text-align: center; padding: 20px; background: #2a2a2a; border-radius: 6px; cursor: pointer; transition: all 0.3s; border: 1px solid #333; }
    .summary-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .summary-item.active { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .summary-item.active .label { color: white; opacity: 0.9; }
    .summary-item.active .value { color: white; }
    .summary-item .label { font-size: 12px; color: #aaa; text-transform: uppercase; margin-bottom: 8px; }
    .summary-item .value { font-size: 32px; font-weight: bold; }
    .summary-item.total .value { color: #4da6ff; }
    .summary-item.passed .value { color: #66bb6a; }
    .summary-item.failed .value { color: #ef5350; }
    .summary-item.duration .value { color: #ab47bc; font-size: 24px; }
    .summary-item.duration { cursor: default; }
    .summary-item.duration:hover { transform: none; box-shadow: none; }
    .tests { padding: 30px; }
    .test { margin-bottom: 30px; border: 2px solid #333; border-radius: 8px; overflow: hidden; }
    .test-header { background: #2a2a2a; padding: 20px; border-bottom: 2px solid #333; display: flex; align-items: center; justify-content: space-between; }
    .test-title { font-size: 18px; font-weight: bold; color: #fff; }
    .test-status { padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
    .test-status.passed { background: #4caf50; color: white; }
    .test-status.failed { background: #f44336; color: white; }
    .test-meta { font-size: 12px; color: #aaa; margin-top: 8px; }
    .steps { padding: 20px; }
    .step { margin-bottom: 15px; padding: 15px; border: 1px solid #333; border-radius: 6px; background: #262626; }
    .step-header { display: flex; align-items: center; margin-bottom: 10px; }
    .step-number { width: 28px; height: 28px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 14px; }
    .step-description { flex: 1; font-size: 15px; color: #ddd; }
    .step-status { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .step-status.passed { background: #4caf50; color: white; }
    .step-status.failed { background: #f44336; color: white; }
    .screenshot { margin-top: 12px; }
    .screenshot img { max-width: 100%; border-radius: 4px; border: 1px solid #444; cursor: pointer; transition: transform 0.2s; }
    .screenshot img:hover { transform: scale(1.02); }
    .screenshot > div { color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div class="logo">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_3t26Re5so5ZUlsCQ-9EMNuCThPDm0c31g&s" alt="IronFX Logo">
        </div>
        <div class="header-text">
          <h1>IronFX Test Report</h1>
        </div>
      </div>
      <div class="meta">
        <div>Started: ${this.startTime.toLocaleString()}</div>
        <div>Finished: ${endTime.toLocaleString()}</div>
      </div>
      <div class="report-info">
        <div class="info-item">
          <div class="info-label">Brand</div>
          <div class="info-value">IronFX</div>
        </div>
        <div class="info-item">
          <div class="info-label">Tester</div>
          <div class="info-value">Sotiris Mouzoulas</div>
        </div>
        <div class="info-item">
          <div class="info-label">Execution Browser</div>
          <div class="info-value">${displayBrowser}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Test Environment</div>
          <div class="info-value">UAT</div>
        </div>
      </div>
      <div class="test-description">
        <div class="test-description-title">Test Cases Description</div>
        <div class="test-description-content">
          This test suite validates the IronFX Client Portal functionality including login authentication and user registration across multiple browsers (Chromium, Firefox, Microsoft Edge). Tests are executed with automated data-driven approach to ensure comprehensive coverage of critical user workflows and form validations.
          <br><br>
          <strong>Test Cases Overview:</strong><br>
          ${this.generateTestCasesList()}
        </div>
      </div>
    </div>
    <div class="summary">
      <div class="summary-item total" onclick="filterTests('all')">
        <div class="label">Total Tests</div>
        <div class="value">${totalTests}</div>
      </div>
      <div class="summary-item passed" onclick="filterTests('passed')">
        <div class="label">Passed</div>
        <div class="value">${passedTests}</div>
      </div>
      <div class="summary-item failed" onclick="filterTests('failed')">
        <div class="label">Failed</div>
        <div class="value">${failedTests}</div>
      </div>
      <div class="summary-item duration">
        <div class="label">Duration</div>
        <div class="value">${duration}s</div>
      </div>
    </div>
    <div class="tests">
      ${this.tests.map((test, index) => {
        const testDuration = (test.duration / 1000).toFixed(2);
        const testId = `test-${index + 1}`;
        const testNumber = index + 1;
        return `
      <div class="test test-collapsed" data-status="${test.status}" id="${testId}">
        <div class="test-header-collapsed" onclick="toggleTest('${testId}')">
          <div style="display: flex; align-items: center; flex: 1;">
            <span class="test-number">#${testNumber}</span>
            <span class="test-title-collapsed">${test.name}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div class="test-status ${test.status}">${test.status}</div>
            <span class="test-toggle-icon">▼</span>
          </div>
        </div>
        <div class="test-content" id="${testId}-content">
          ${test.description ? `<div class="test-case-description">${test.description}</div>` : ''}
          ${test.combinations && test.combinations.length > 0 ? `
            <div class="combinations-list">
              <div class="combinations-title">Test Combinations (${test.combinations.length})</div>
              <div class="combinations-items">
                ${test.combinations.map((combo, idx) => `<div class="combination-item">${idx + 1}. ${combo}</div>`).join('')}
              </div>
            </div>
          ` : ''}
          <div class="test-header" style="background: #1a1a1a; padding: 15px 20px;">
            <div>
              <div class="test-title" style="margin-bottom: 8px;">${test.name}</div>
              <div class="test-meta">Duration: ${testDuration}s | Steps: ${test.steps.length}</div>
            </div>
          </div>
          <div class="steps" style="padding: 20px; background: #1a1a1a;">
            ${test.steps.map(step => `
            <div class="step">
              <div class="step-header">
                <div class="step-number">${step.number}</div>
                <div class="step-description">${step.description}</div>
                <div class="step-status ${step.status}">${step.status}</div>
              </div>
              ${step.screenshots && step.screenshots.length > 0 ? step.screenshots.map(screenshot => `
                <div class="screenshot">
                  <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${screenshot.name}</div>
                  <img src="${screenshot.data}" alt="${screenshot.name}" onclick="window.open(this.src)" style="max-width: 100%; cursor: pointer; border: 1px solid #444; border-radius: 4px;">
                </div>
              `).join('') : ''}
            </div>
            `).join('')}
          </div>
        </div>
      </div>
      `;
      }).join('')}
    </div>
  </div>
  <script>
    let currentFilter = 'all';

    function filterTests(status) {
      currentFilter = status;
      const tests = document.querySelectorAll('.test');
      const summaryItems = document.querySelectorAll('.summary-item');

      summaryItems.forEach(item => item.classList.remove('active'));

      if (status === 'all') {
        tests.forEach(test => test.style.display = 'block');
        document.querySelector('.summary-item.total').classList.add('active');
      } else if (status === 'passed') {
        tests.forEach(test => {
          test.style.display = test.dataset.status === 'passed' ? 'block' : 'none';
        });
        document.querySelector('.summary-item.passed').classList.add('active');
      } else if (status === 'failed') {
        tests.forEach(test => {
          test.style.display = test.dataset.status === 'failed' ? 'block' : 'none';
        });
        document.querySelector('.summary-item.failed').classList.add('active');
      }
    }

    function toggleTest(testId) {
      const content = document.getElementById(testId + '-content');
      const icon = document.querySelector('#' + testId + ' .test-toggle-icon');

      if (content && icon) {
        content.classList.toggle('expanded');
        icon.classList.toggle('expanded');
      }
    }

    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('test-overview-link')) {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        const testElement = document.querySelector(href);
        if (testElement) {
          testElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          testElement.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
          setTimeout(() => {
            testElement.style.backgroundColor = '';
          }, 2000);
        }
      }
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`\n✓ Custom report generated: ${reportPath}`);

    const jsonData = {
      testType,
      browser: displayBrowser,
      headless: process.env.HEADLESS === 'true',
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      stats: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests
      },
      tests: this.tests.map(test => ({
        name: test.name,
        status: test.status,
        duration: test.duration,
        description: test.description,
        startTime: test.startTime.toISOString(),
        endTime: test.endTime.toISOString(),
        steps: test.steps,
        combinations: test.combinations
      }))
    };

    fs.writeFileSync(jsonReportPath, JSON.stringify(jsonData, null, 2));
    console.log(`✓ JSON report data saved: ${jsonReportPath}`);
  }
}

module.exports = CustomHTMLReporter;
