import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requiredKeys = [
  'CIRCLE_API_KEY',
  'BASE_SEPOLIA_RPC',
  'SELLER_PRIVATE_KEY' // Usually SDK uses this
];

// Check also LIS_MODE
if (process.env.LIS_MODE !== 'TESTNET') {
  console.warn('⚠️  LIS_MODE is not set to TESTNET. Tests might fail or run in LOCAL mode.');
}

const missing = requiredKeys.filter(key => !process.env[key] || process.env[key]?.includes('your_'));

if (missing.length > 0) {
  console.error(`❌ Missing or default keys: ${missing.join(', ')}`);
  process.exit(1);
} else {
  console.log('✅ Environment checks passed.');
}
