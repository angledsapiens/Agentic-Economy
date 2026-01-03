/**
 * Demo: Inter-Agent Commerce Handshake
 * Simulates a hiring flow between 'Coder' and 'Auditor' agents.
 */
import { executePayment } from './circle.js';
import dotenv from 'dotenv';

dotenv.config();

const AUDITOR_ADDRESS = '0xe7410170f6645ad9069552154693952787c1691a'; // Known testnet address
const PAYMENT_AMOUNT = '0.01';

async function runDemo() {
  console.log("[SYSTEM] Agent 'Coder' hiring Agent 'Auditor'...");

  // Simulate handshake delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const txId = await executePayment(PAYMENT_AMOUNT, AUDITOR_ADDRESS, 'demo-handshake');
    console.log(`[SUCCESS] ${PAYMENT_AMOUNT} USDC transferred via ${txId}`);

    console.log('[SYSTEM] Updating Treasury Dashboard...');
    const cp = await import('child_process');
    cp.execSync('npx tsx generate_dashboard.ts', { stdio: 'inherit' });

  } catch (error: any) {
    console.error(`[FAILURE] Handshake failed: ${error.message}`);
    process.exit(1);
  }
}

runDemo();
