const fs = require('fs');
const path = require('path');

class HTMLReportGenerator {
  constructor() {
    this.tests = [];
    this.startTime = new Date();
    this.reportPath = '';
    this.currentTest = null;
    this.reportFinalized = false;
  }

  startReport() {
    const datetime = new Date().toISOString().replace(/:/g, '-').split('.')[0].replace('T', '_');
    this.reportPath = path.join(process.cwd(), 'reports', `report_${datetime}.html`);

    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
  }

  startTest(testName) {
    this.currentTest = {
      name: testName,
      steps: [],
      startTime: new Date(),
      status: 'passed'
    };
  }

  logStep(description, status, screenshotPath = '') {
    if (!this.currentTest) return;

    this.currentTest.steps.push({
      number: this.currentTest.steps.length + 1,
      description,
      status,
      screenshotPath
    });

    if (status === 'failed') {
      this.currentTest.status = 'failed';
    }
  }

  endTest() {
    if (this.currentTest) {
      this.currentTest.endTime = new Date();
      this.tests.push(this.currentTest);
      this.currentTest = null;
    }
  }

  finalizeReport() {
    // Prevent multiple report generation in same run
    if (this.reportFinalized) {
      return this.reportPath;
    }
    this.reportFinalized = true;

    const endTime = new Date();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    const passedTests = this.tests.filter(t => t.status === 'passed').length;
    const failedTests = this.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.tests.length;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>IronFX Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .meta { font-size: 14px; opacity: 0.9; }
    .summary { display: flex; padding: 30px; border-bottom: 1px solid #e0e0e0; gap: 20px; }
    .summary-item { flex: 1; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 6px; }
    .summary-item .label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
    .summary-item .value { font-size: 32px; font-weight: bold; }
    .summary-item.total .value { color: #2196f3; }
    .summary-item.passed .value { color: #4caf50; }
    .summary-item.failed .value { color: #f44336; }
    .summary-item.duration .value { color: #9c27b0; font-size: 24px; }
    .tests { padding: 30px; }
    .test { margin-bottom: 30px; border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .test-header { background: #f9f9f9; padding: 20px; border-bottom: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
    .test-title { font-size: 18px; font-weight: bold; color: #333; }
    .test-status { padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
    .test-status.passed { background: #4caf50; color: white; }
    .test-status.failed { background: #f44336; color: white; }
    .test-meta { font-size: 12px; color: #666; margin-top: 8px; }
    .steps { padding: 20px; }
    .step { margin-bottom: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; }
    .step-header { display: flex; align-items: center; margin-bottom: 10px; }
    .step-number { width: 28px; height: 28px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 14px; }
    .step-description { flex: 1; font-size: 15px; color: #333; }
    .step-status { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .step-status.passed { background: #4caf50; color: white; }
    .step-status.failed { background: #f44336; color: white; }
    .screenshot { margin-top: 12px; }
    .screenshot img { max-width: 100%; border-radius: 4px; border: 1px solid #ddd; cursor: pointer; transition: transform 0.2s; }
    .screenshot img:hover { transform: scale(1.02); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>IronFX Test Report</h1>
      <div class="meta">
        <div>Started: ${this.startTime.toLocaleString()}</div>
        <div>Finished: ${endTime.toLocaleString()}</div>
      </div>
    </div>
    <div class="summary">
      <div class="summary-item total">
        <div class="label">Total Tests</div>
        <div class="value">${totalTests}</div>
      </div>
      <div class="summary-item passed">
        <div class="label">Passed</div>
        <div class="value">${passedTests}</div>
      </div>
      <div class="summary-item failed">
        <div class="label">Failed</div>
        <div class="value">${failedTests}</div>
      </div>
      <div class="summary-item duration">
        <div class="label">Duration</div>
        <div class="value">${duration}s</div>
      </div>
    </div>
    <div class="tests">
      ${this.tests.map(test => {
        const testDuration = ((test.endTime - test.startTime) / 1000).toFixed(2);
        return `
      <div class="test">
        <div class="test-header">
          <div>
            <div class="test-title">${test.name}</div>
            <div class="test-meta">Duration: ${testDuration}s | Steps: ${test.steps.length}</div>
          </div>
          <div class="test-status ${test.status}">${test.status}</div>
        </div>
        <div class="steps">
          ${test.steps.map(step => `
          <div class="step">
            <div class="step-header">
              <div class="step-number">${step.number}</div>
              <div class="step-description">${step.description}</div>
              <div class="step-status ${step.status}">${step.status}</div>
            </div>
            ${step.screenshotPath ? `<div class="screenshot"><img src="${step.screenshotPath}" alt="Screenshot ${step.number}" onclick="window.open(this.src)"></div>` : ''}
          </div>
          `).join('')}
        </div>
      </div>
      `;
      }).join('')}
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(this.reportPath, html);
    return this.reportPath;
  }
}

let globalReportInstance = null;

function getGlobalReport() {
  if (!globalReportInstance) {
    globalReportInstance = new HTMLReportGenerator();
    globalReportInstance.startReport();
  }
  return globalReportInstance;
}

module.exports = { HTMLReportGenerator, getGlobalReport };
