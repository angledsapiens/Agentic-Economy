
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { TreasuryManager } from '../src/treasury/manager';
import { CircleSettlementProvider } from '../src/settlement/circle-provider';
import { FiduciaryGuardian } from '../src/fiduciary/guardian';
import { CommerceProfile, CommercePolicy } from '../src/core/profile';
import { InterpretedIntent, IntentType } from '../src/core/interpretation';
import { RESERVATION_EXPIRY } from '../src/core/constants';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log("=== STEP 1: LIS CORE INVARIANT TESTS ===\n");

  // 0. Setup
  const policyPath = path.resolve(__dirname, '../Policy.json');
  const policyRaw = fs.readFileSync(policyPath, 'utf-8');
  const policy = JSON.parse(policyRaw);
  console.log(`[Setup] Loaded Policy: Global Limit = ${policy.globalLimit}, Daily Limit = ${policy.dailyLimit}`);

  // CHECK FOR CRITICAL ENV VARS
  if (!process.env.CIRCLE_API_KEY) console.warn("⚠️ WARNING: CIRCLE_API_KEY missing in .env");
  if (!process.env.WALLET_ID) console.warn("⚠️ WARNING: WALLET_ID missing in .env (Settlement may fail)");

  const provider = new CircleSettlementProvider(
    process.env.CIRCLE_API_KEY || '',
    process.env.WALLET_ID
  );

  const treasury = new TreasuryManager(provider);
  const guardian = new FiduciaryGuardian();

  // Mock Profile adhering to Policy
  const profile: CommerceProfile = {
    id: 'did:web:test-agent',
    status: 'ACTIVE' as any,
    activePolicyId: policy.id,
    identity: {
      displayName: 'Test Agent',
      serviceEndpoint: 'http://localhost:3000',
      publicKey: '0x...'
    },
    capabilities: []
  };

  // 1. Test: Intent OVER Policy Limit
  console.log("\n--- Test 1.1: Intent OVER Policy Limit ---");
  const excessiveAmount = BigInt(policy.globalLimit) + 100n;
  const failIntent: InterpretedIntent = {
    type: IntentType.BUY,
    counterparty: '0xBadActor',
    reasoning: 'Testing Limits',
    subject: { name: 'Test', description: 'Over Limit' },
    settlement: { asset: 'USDC', amount: excessiveAmount.toString() },
    metadata: { templateType: 'BUY_SERVICE', serviceName: 'Test', sellerDID: 'did:test', maxPrice: '0', description: '' }
  };

  const failResult = guardian.validate(failIntent, profile, policy, "0"); // 0 daily spend
  console.log(`Result: ${failResult.decision} (Reason: ${failResult.reason})`);

  if (failResult.decision !== 'DENY') {
    throw new Error(`❌ FAILED: Expected DENY for amount ${excessiveAmount}, got ${failResult.decision}`);
  } else {
    console.log("✅ PASS: Excessive intent DENIED.");
  }

  // 2. Test: Intent WITHIN Policy Limit
  console.log("\n--- Test 1.2: Intent WITHIN Policy Limit ---");
  // FIX: Use amount strictly BELOW autoApproveBelow (1,000,000)
  const safeAmount = BigInt(500000);
  const passIntent: InterpretedIntent = {
    ...failIntent,
    settlement: { asset: 'USDC', amount: safeAmount.toString() }
  };

  const passResult = guardian.validate(passIntent, profile, policy, "0");
  console.log(`Result: ${passResult.decision}`);

  if (passResult.decision !== 'ALLOW') {
    throw new Error(`❌ FAILED: Expected ALLOW for amount ${safeAmount}, got ${passResult.decision}`);
  } else {
    console.log("✅ PASS: Valid intent ALLOWED.");
  }

  // 3. Test: Treasury Reservation
  console.log("\n--- Test 1.3: Treasury Reservation ---");
  console.log("Fetching initial snapshot...");
  try {
    const initialSnap = await treasury.getSnapshot('USDC');
    console.log(`Initial: Available=${initialSnap.availableBalance}, Reserved=${initialSnap.reservedBalance}`);

    console.log(`Reserving ${safeAmount} USDC...`);
    const reservation = await treasury.reserveFunds(passIntent);

    const afterSnap = await treasury.getSnapshot('USDC');
    console.log(`After: Available=${afterSnap.availableBalance}, Reserved=${afterSnap.reservedBalance}`);

    const expectedReserved = BigInt(initialSnap.reservedBalance) + safeAmount;

    if (BigInt(afterSnap.reservedBalance) !== expectedReserved) {
      throw new Error("❌ FAILED: Reserved balance mismatch.");
    }
    console.log("✅ PASS: Funds Reserved correctly.");

    // 4. Test: Settlement
    console.log("\n--- Test 1.4: Settlement Execution ---");
    const destAddress = '0x0000000000000000000000000000000000000001';
    console.log(`Settling reservation ${reservation.id} to ${destAddress}...`);

    const txHash = await treasury.settle(reservation.id, destAddress);
    console.log(`Settlement ID: ${txHash}`);

    if (!txHash) throw new Error("❌ FAILED: No tx hash returned.");
    console.log("✅ PASS: Settlement executed.");

  } catch (err: any) {
    console.error("❌ FAILURE IN TREASURY TEST:", err.message);
    if (err.message.includes('Wallet ID')) {
      console.error(">>> ROOT CAUSE: Missing WALLET_ID in .env prevents successful settlement.");
    }
  }
}

run().catch(console.error);
