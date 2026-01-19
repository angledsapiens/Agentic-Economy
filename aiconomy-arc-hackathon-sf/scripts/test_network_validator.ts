import { validateARCNetwork } from '../src/config/network-validator';

async function test() {
  console.log('Testing ARC Network Validation...\n');

  try {
    await validateARCNetwork('https://rpc.testnet.arc.network');
    console.log('\n✅ Network validation test PASSED');
  } catch (error: any) {
    console.error('\n❌ Network validation test FAILED');
    console.error(error.message);
    process.exit(1);
  }
}

test();
