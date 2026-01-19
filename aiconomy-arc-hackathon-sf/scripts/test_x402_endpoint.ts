/**
 * Quick x402 endpoint test
 */

import axios from 'axios';

async function testX402() {
  console.log('Testing x402 endpoint on port 3001...\n');

  try {
    const response = await axios.get('http://localhost:3001/hire', {
      validateStatus: () => true // Don't throw on 402
    });

    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, response.headers);

    if (response.status === 402) {
      console.log('\n✅ x402 endpoint working correctly!');
      console.log('Response indicates payment required.');
    } else {
      console.log(`\nℹ️  Got ${response.status}, expected 402`);
    }
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
  }
}

testX402();
