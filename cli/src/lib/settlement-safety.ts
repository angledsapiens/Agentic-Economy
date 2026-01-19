import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../aiconomy-arc-hackathon-sf/.env') });

/**
 * CLI Startup Safety Check
 * Validates settlement configuration before allowing CLI commands.
 */
export async function validateSettlementMode() {
  const mode = process.env.LIS_MODE || 'LOCAL';

  if (mode === 'TESTNET') {
    console.log('\n🚨 ═══════════════════════════════════════════════════════');
    console.log('   ⚠️  LIVE ARC TESTNET MODE ACTIVE');
    console.log('   Real on-chain USDC transfers WILL occur!');
    console.log('   Network: ARC Testnet (Chain ID 5042002)');
    console.log('   Settlement: Direct EVM transactions');
    console.log('═══════════════════════════════════════════════════════\n');

    // Verify required credentials
    if (!process.env.SELLER_PRIVATE_KEY) {
      console.error('❌ CRITICAL: SELLER_PRIVATE_KEY missing in .env');
      console.error('Cannot execute real transactions without private key.\n');
      process.exit(1);
    }

    if (!process.env.ARC_USDC_CONTRACT) {
      console.warn('⚠️  WARNING: ARC_USDC_CONTRACT not set in .env');
      console.warn('USDC transfers may fail if contract address is incorrect.\n');
    }

    console.log('✅ Settlement configuration validated\n');
  } else if (mode === 'LOCAL') {
    console.log('\nℹ️  Running in LOCAL mode (stubbed settlement)\n');
  }
}
