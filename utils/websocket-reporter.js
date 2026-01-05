// WebSocket reporter for streaming test progress
// This is used when tests are run from the UI
class WebSocketReporter {
  constructor() {
    this.tests = [];
  }

  onBegin(config, suite) {
    console.log(`\n▶ Starting test suite with ${suite.allTests().length} tests\n`);
  }

  onTestBegin(test) {
    const testName = test.title;
    console.log(`\n┌─ 🧪 Test: ${testName}`);
    console.log(`│  Status: Running...`);
  }

  onStepBegin(test, result, step) {
    if (!step.title.startsWith('Before Hooks') && !step.title.startsWith('After Hooks')) {
      console.log(`│  ├─ 📝 Step: ${step.title}`);
    }
  }

  onStepEnd(test, result, step) {
    if (!step.title.startsWith('Before Hooks') && !step.title.startsWith('After Hooks')) {
      const status = step.error ? '❌ Failed' : '✅ Passed';
      console.log(`│  │  ${status}`);
      if (step.error) {
        console.log(`│  │  Error: ${step.error.message}`);
      }
    }
  }

  onTestEnd(test, result) {
    const testName = test.title;
    const duration = (result.duration / 1000).toFixed(2);

    if (result.status === 'passed') {
      console.log(`│  ✅ Result: PASSED`);
    } else if (result.status === 'failed') {
      console.log(`│  ❌ Result: FAILED`);
      if (result.error) {
        console.log(`│  Error: ${result.error.message}`);
      }
    } else if (result.status === 'skipped') {
      console.log(`│  ⊘ Result: SKIPPED`);
    }

    console.log(`│  Duration: ${duration}s`);
    console.log(`└─ End of test\n`);
  }

  onEnd(result) {
    const { status, startTime } = result;
    const duration = ((Date.now() - startTime.getTime()) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Test Suite Complete`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Status: ${status}`);
    console.log(`Duration: ${duration}s`);
    console.log(`${'='.repeat(50)}\n`);
  }
}

module.exports = WebSocketReporter;
