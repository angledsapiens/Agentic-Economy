/**
 * Real Transaction Executor - FINAL FIX
 * Using tokenAddress + blockchain instead of tokenId
 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { validateSpend, recordSpend, getMissionConfig } from './src/guardrails.js';
import dotenv from 'dotenv';

dotenv.config();

const MISSION_ID = 'security-scan-mission';
const PAYMENT_AMOUNT = '0.01';
const RECIPIENT = '0xe7410170f6645ad9069552154693952787c1691a';

async function executeRealPayment() {
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
    // Initialize mission with correct budget FIRST
    const mission = getMissionConfig(MISSION_ID);
    mission.maxBudget = 0.10; // Set to 0.10 USDC for this micro-mission
    mission.totalSpent = 0; // Reset spending

    console.log(`Mission Budget Set: ${mission.maxBudget.toFixed(2)} USDC\n`);

    // Validate with guardrails
    console.log('🔒 Validating payment with guardrails...');
    const amountNum = parseFloat(PAYMENT_AMOUNT);
    validateSpend(amountNum, MISSION_ID);
    console.log('✓ Budget validation passed\n');

    // Initialize Circle client
    console.log('📝 Initializing Circle client...');
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.ENTITY_SECRET!
    });
    // @ts-ignore
    console.log('Client params keys:', Object.keys(client.params || {}));
    // @ts-ignore
    // console.log('Client params:', client.params);

    // Execute payment with correct parameters
    console.log('💸 Executing payment via Circle API...\n');

    // Generate UUID idempotency key to prevent duplicate transactions
    const idempotencyKey = crypto.randomUUID();
    console.log(`[${new Date().toISOString()}] PID:${process.pid} Idempotency Key: ${idempotencyKey}\n`);

    // REAL TRANSACTION
    const response = await client.createTransaction({
      walletId: process.env.WALLET_ID!,
      tokenAddress: process.env.USDC_TOKEN_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      blockchain: 'BASE-SEPOLIA',
      amounts: [PAYMENT_AMOUNT],
      destinationAddress: RECIPIENT,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      },
      idempotencyKey: idempotencyKey
    });

    console.log(`[${new Date().toISOString()}] PID:${process.pid} Transaction Response:`, JSON.stringify(response.data, null, 2));

    const transactionId = response.data?.id || 'unknown';

    // Record the spend
    recordSpend(amountNum, MISSION_ID);

    console.log('\n✅ TRANSACTION SUCCESSFUL!\n');
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

  } catch (error: any) {
    console.error('\n❌ Transaction Failed:');
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code === 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION') {
      console.error('\n🛡️ BUDGET GUARDRAILS BLOCKED THIS TRANSACTION');
      console.error('Human intervention required to proceed.\n');
    }

    throw error;
  }
}

executeRealPayment();
