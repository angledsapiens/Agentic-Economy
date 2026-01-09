import { fetch } from 'undici'; // Built-in in Node 18+, but explicit import if needed in older envs. Or just use global fetch.
// Actually Node 20+ has global fetch.

const TARGET_URL = 'https://flankr.vercel.app/api';

async function checkFrame() {
  console.log(`Checking Frame at: ${TARGET_URL}`);

  try {
    const response = await fetch(TARGET_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} bytes.`);

    const checks = [
      { pattern: /meta property="fc:frame" content="vNext"/, name: 'Frame Version' },
      { pattern: /meta property="og:image"/, name: 'OpenGraph Image' },
      { pattern: /meta property="fc:frame:image"/, name: 'Frame Image' },
      { pattern: /meta property="fc:frame:button:1"/, name: 'Button 1' }
    ];

    let passed = 0;
    for (const check of checks) {
      if (check.pattern.test(html)) {
        console.log(`[PASS] ${check.name} found.`);
        passed++;
      } else {
        console.error(`[FAIL] ${check.name} NOT found.`);
      }
    }

    if (passed === checks.length) {
      console.log('\n✅ All checks passed. Frame is valid.');
      process.exit(0);
    } else {
      console.error(`\n❌ Validation failed. ${checks.length - passed} checks missing.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkFrame();
