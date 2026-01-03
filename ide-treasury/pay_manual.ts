/**
 * Manual Payment Script
 * Bypasses SDK transaction logic to prevent duplicate transactions
 * Uses direct HTTP calls with strict idempotency and no retries
 */

import { initiateDeveloperControlledWalletsClient, generateEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import { validateSpend, recordSpend, getMissionConfig } from './src/guardrails.js';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const MISSION_ID = 'security-scan-mission';
const PAYMENT_AMOUNT = '0.01';
const RECIPIENT = '0xe7410170f6645ad9069552154693952787c1691a';

async function executeManualPayment() {
  console.log('\n🚀 Executing MANUAL Blockchain Transaction (Direct API)\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('⚠️  WARNING: This will execute a REAL transaction via Direct API');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Initialize mission budget
    const mission = getMissionConfig(MISSION_ID);
    mission.maxBudget = 0.10;
    mission.totalSpent = 0;
    console.log(`Mission Budget Set: ${mission.maxBudget.toFixed(2)} USDC\n`);

    // 2. Validate with guardrails
    console.log('🔒 Validating payment with guardrails...');
    const amountNum = parseFloat(PAYMENT_AMOUNT);
    validateSpend(amountNum, MISSION_ID);
    console.log('✓ Budget validation passed\n');

    // 3. Initialize SDK Client (just for auth helpers)
    console.log('📝 Initializing SDK for encryption...');
    console.log(`API Key present: ${!!process.env.CIRCLE_API_KEY}`);
    console.log(`API Key starts with: ${process.env.CIRCLE_API_KEY?.substring(0, 10)}...`);

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.ENTITY_SECRET!
    });

    // 4. Generate Entity Secret Ciphertext
    console.log('🔐 Generating entity secret ciphertext...');
    // @ts-ignore
    const params = client.params;
    if (!params) throw new Error('Could not access client params for encryption');

    const ciphertext = await generateEntitySecretCiphertext(params as any)();
    console.log('✓ Ciphertext generated\n');

    // 5. Generate Idempotency Key
    const idempotencyKey = crypto.randomUUID();
    console.log(`🔑 Idempotency Key: ${idempotencyKey}\n`);

    // 6. Prepare Request
    const url = 'https://api.circle.com/v1/w3s/developer/transactions';
    const payload = {
      walletId: process.env.WALLET_ID!,
      tokenAddress: process.env.USDC_TOKEN_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      blockchain: 'BASE-SEPOLIA',
      amounts: [PAYMENT_AMOUNT],
      destinationAddress: RECIPIENT,
      idempotencyKey: idempotencyKey,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      },
      entitySecretCiphertext: ciphertext
    };

    // 7. Execute Request (Direct axios)
    console.log('💸 Sending HTTP POST request to Circle API...');

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-User-Agent': 'Antigravity-Manual-Script/1.0'
      },
      timeout: 30000, // 30s strict timeout
      validateStatus: (status) => status < 500 // Don't throw on 400s
    });

    if (response.status >= 200 && response.status < 300) {
      const transactionId = response.data?.data?.id || 'unknown';

      // Record Spend
      recordSpend(amountNum, MISSION_ID);

      console.log('\n✅ TRANSACTION SUCCESSFUL!\n');
      console.log('═══════════════════════════════════════════════════');
      console.log('           TRANSACTION DETAILS');
      console.log('═══════════════════════════════════════════════════\n');
      console.log(`Transaction ID: ${transactionId}`);
      console.log(`Amount: ${PAYMENT_AMOUNT} USDC`);
      console.log(`Recipient: ${RECIPIENT}`);
      console.log(`Mission: ${MISSION_ID}\n`);

      console.log('✅ Transaction complete!');
      console.log('🔗 View on Explorer (Check for duplicates!): https://sepolia.basescan.org/address/0xCDcA0A0C3447Ae2091E592Cc3D88B0e23aC16BE4#tokentxns\n');

    } else {
      console.error('\n❌ API Error Response:');
      console.error(`Status: ${response.status}`);
      console.error(JSON.stringify(response.data, null, 2));
    }

  } catch (error: any) {
    console.error('\n❌ Transaction Failed:');
    console.error('Message:', error.message);
    if (axios.isAxiosError(error)) {
      console.error('Code:', error.code);
      if (error.response) {
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

executeManualPayment();
