/**
 * Real Transaction Executor (CommonJS)
 */

const { executePayment } = require('./src/circle.ts');
const { getMissionConfig } = require('./src/guardrails.ts');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MISSION_ID = 'security-scan-mission';
const PAYMENT_AMOUNT = '0.01';
const RECIPIENT = '0xe7410170f6645ad9069552154693952787c1691a';

async function executeRealTransaction() {
  console.log('\n🚀 Executing REAL Blockchain Transaction\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('⚠️  WARNING: This will execute a REAL transaction');
  console.log('═══════════════════════════════════════════════════\n');

  const mission = getMissionConfig(MISSION_ID);
  console.log(`Mission: ${MISSION_ID}`);
  console.log(`Budget: ${mission.maxBudget.toFixed(2)} USDC`);
  console.log(`Already Spent: ${mission.totalSpent.toFixed(2)} USDC`);
  console.log(`Payment Amount: ${PAYMENT_AMOUNT} USDC`);
  console.log(`Recipient: ${RECIPIENT}\n`);

  try {
    console.log('🔒 Validating payment with guardrails...');
    console.log('📝 Executing payment via Circle API...\n');

    const transactionId = await executePayment(PAYMENT_AMOUNT, RECIPIENT, MISSION_ID);

    console.log('✅ TRANSACTION SUCCESSFUL!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('           TRANSACTION DETAILS');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Amount: ${PAYMENT_AMOUNT} USDC`);
    console.log(`Recipient: ${RECIPIENT}`);
    console.log(`Mission: ${MISSION_ID}\n`);

    const updatedMission = getMissionConfig(MISSION_ID);
    const remaining = updatedMission.maxBudget - updatedMission.totalSpent;

    console.log('💰 Budget Status:');
    console.log(`   Total Spent: ${updatedMission.totalSpent.toFixed(2)} USDC`);
    console.log(`   Remaining: ${remaining.toFixed(2)} USDC`);
    console.log(`   Budget Used: ${((updatedMission.totalSpent / updatedMission.maxBudget) * 100).toFixed(1)}%\n`);

    console.log('✅ Transaction complete!');
    console.log('🔗 View on Explorer: https://sepolia.basescan.org/address/0xCDcA0A0C3447Ae2091E592Cc3D88B0e23aC16BE4#tokentxns\n');
    console.log('⏳ Note: It may take 30-60 seconds for the transaction to appear on the explorer\n');

  } catch (error) {
    console.error('\n❌ Transaction Failed:', error.message);

    if (error.code === 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION') {
      console.error('\n🛡️ BUDGET GUARDRAILS BLOCKED THIS TRANSACTION');
      console.error('Human intervention required to proceed.\n');
    }

    process.exit(1);
  }
}

executeRealTransaction().catch(console.error);
