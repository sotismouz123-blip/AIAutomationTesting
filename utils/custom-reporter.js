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

  onTestEnd(test, result) {
    const testName = test.title;
    const annotations = test.annotations || [];

    // Extract steps from result and map attachments to steps
    const steps = result.steps
      .filter(step => !step.title.startsWith('Before Hooks') && !step.title.startsWith('After Hooks'))
      .map((step, index) => {
        const stepData = {
          number: index + 1,
          description: step.title,
          status: step.error ? 'failed' : 'passed',
          screenshots: []
        };

        // Find attachments that belong to this step
        if (result.attachments) {
          result.attachments.forEach(attachment => {
            if (attachment.contentType === 'image/png' || attachment.contentType === 'image/jpeg') {
              // Convert screenshot to base64
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
      duration: result.duration
    });
  }

  async onEnd(result) {
    const endTime = new Date();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    const passedTests = this.tests.filter(t => t.status === 'passed').length;
    const failedTests = this.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.tests.length;

    const datetime = new Date().toISOString().replace(/:/g, '-').split('.')[0].replace('T', '_');
    const reportPath = path.join(process.cwd(), 'reports', `report_${datetime}.html`);

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
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .meta { font-size: 14px; opacity: 0.9; }
    .summary { display: flex; padding: 30px; border-bottom: 1px solid #e0e0e0; gap: 20px; }
    .summary-item { flex: 1; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
    .summary-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .summary-item.active { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .summary-item.active .label { color: white; opacity: 0.9; }
    .summary-item.active .value { color: white; }
    .summary-item .label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
    .summary-item .value { font-size: 32px; font-weight: bold; }
    .summary-item.total .value { color: #2196f3; }
    .summary-item.passed .value { color: #4caf50; }
    .summary-item.failed .value { color: #f44336; }
    .summary-item.duration .value { color: #9c27b0; font-size: 24px; }
    .summary-item.duration { cursor: default; }
    .summary-item.duration:hover { transform: none; box-shadow: none; }
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
      ${this.tests.map(test => {
        const testDuration = (test.duration / 1000).toFixed(2);
        return `
      <div class="test" data-status="${test.status}">
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
            ${step.screenshots && step.screenshots.length > 0 ? step.screenshots.map(screenshot => `
              <div class="screenshot">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${screenshot.name}</div>
                <img src="${screenshot.data}" alt="${screenshot.name}" onclick="window.open(this.src)" style="max-width: 100%; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            `).join('') : ''}
          </div>
          `).join('')}
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

      // Update active state on summary items
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
  </script>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`\n✓ Custom report generated: ${reportPath}`);
  }
}

module.exports = CustomHTMLReporter;
