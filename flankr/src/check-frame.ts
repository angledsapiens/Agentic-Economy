import { fetch } from 'undici';

const BASE_URL = 'https://flankr.vercel.app/api';

async function verifyFlow() {
  console.log('🚀 Verifying Interactive Frame Flow...');

  try {
    // 1. Initial State
    console.log('1️⃣ Fetching Initial Frame (via /api/price)...');
    const res1 = await fetch(`${BASE_URL}/price`);
    if (!res1.ok) throw new Error(`Init failed: ${res1.status}`);
    const html1 = await res1.text();
    // The price frame has 'Step 1: Target Price', let's check for that or generic meta
    if (!html1.includes('fc:frame')) throw new Error('Missing Frame Metadata');
    console.log('✅ Interactive Frame Valid');

    // Note: Simulating full POST flow with signature validation requires complex mocking.
    // For this check, we primarily verify the endpoints exist and return Frame metatags.
    // In a real integration test we would mock the signature packet.

    console.log('⚠️ Full POST simulation requires signature mocking. Skipping deep state check.');
    console.log('✅ Basic Metadata Check Passed.');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

verifyFlow();
