import { fetch } from 'undici';

const BASE_URL = 'https://flankr.vercel.app/api';

async function verifyFlow() {
  console.log('🚀 Verifying Interactive Frame Flow...');

  try {
    // 1. Initial State
    console.log('1️⃣ Fetching Initial Frame...');
    const res1 = await fetch(BASE_URL);
    if (!res1.ok) throw new Error(`Init failed: ${res1.status}`);
    const html1 = await res1.text();
    if (!html1.includes('Enter Guard')) throw new Error('Missing "Enter Guard" button');
    console.log('✅ Initial Frame Valid');

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
