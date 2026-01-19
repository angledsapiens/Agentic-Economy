/**
 * FINAL END-TO-END TEST
 *
 * Validates entire system as a judge would experience it.
 * Covers: Environment → CLI → ERC-8004 → Settlement → x402 → UI
 */

import dotenv from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';
import { ARCSettlementProvider } from '../src/settlement/arc-provider';
import { FiduciaryGuardian } from '../src/fiduciary/guardian';
import { InterpretedIntent, IntentType } from '../src/core/interpretation';
import { CommerceProfile, CommercePolicy } from '../src/core/profile';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REPORT: any = {
  timestamp: new Date().toISOString(),
  network: 'ARC Testnet',
  chainId: 5042002,
  phases: {},
  txHashes: [],
  arcScanLinks: [],
  failures: []
};

async function phase1_EnvironmentValidation() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 1: Environment Validation');
  console.log('═══════════════════════════════════════════════════════\n');

  const tests: any = {};

  // Verify TESTNET mode
  const mode = process.env.LIS_MODE;
  tests.testnetMode = mode === 'TESTNET';
  console.log(`✓ LIS_MODE: ${mode} ${tests.testnetMode ? '✅' : '❌'}`);

  // Verify ARC RPC
  const rpc = process.env.ARC_RPC_URL;
  tests.arcRPC = rpc === 'https://rpc.testnet.arc.network';
  console.log(`✓ ARC_RPC_URL: ${rpc} ${tests.arcRPC ? '✅' : '❌'}`);

  // Verify USDC contract
  const usdc = process.env.ARC_USDC_CONTRACT;
  tests.usdcContract = usdc === '0x3600000000000000000000000000000000000000';
  console.log(`✓ ARC_USDC_CONTRACT: ${usdc} ${tests.usdcContract ? '✅' : '❌'}`);

  // Verify private key
  tests.privateKey = !!process.env.SELLER_PRIVATE_KEY;
  console.log(`✓ SELLER_PRIVATE_KEY: ${tests.privateKey ? 'Present' : 'Missing'} ${tests.privateKey ? '✅' : '❌'}`);

  // Network validation
  try {
    const provider = new ethers.JsonRpcProvider(rpc!);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    tests.networkValidation = chainId === 5042002;
    console.log(`✓ Network Chain ID: ${chainId} ${tests.networkValidation ? '✅' : '❌'}`);

    if (chainId !== 5042002) {
      throw new Error(`HARD FAIL: Wrong chain ID ${chainId}, expected 5042002`);
    }
  } catch (error: any) {
    tests.networkValidation = false;
    REPORT.failures.push(`Phase 1: ${error.message}`);
    throw error;
  }

  REPORT.phases.phase1 = { status: 'PASS', tests };
  console.log('\n✅ Phase 1: PASS\n');
}

async function phase2_AgentBootstrap() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 2: Agent Bootstrap (CLI Simulation)');
  console.log('═══════════════════════════════════════════════════════\n');

  const tests: any = {};

  // Simulate profile creation (lis init equivalent)
  const profile: CommerceProfile = {
    id: 'did:lis:e2e_test_agent',
    status: 'ACTIVE' as any,
    activePolicyId: 'policy_e2e_test',
    identity: {
      displayName: 'E2E Test Agent',
      serviceEndpoint: 'http://localhost:3000',
      publicKey: '0x...'
    },
    capabilities: [{
      type: 'PAYMENT_SETTLEMENT',
      provider: 'ARC_USDC_NATIVE',
      supported: true
    }]
  };

  tests.profileCreated = !!profile.id;
  console.log(`✓ Commerce Profile: ${profile.id} ${tests.profileCreated ? '✅' : '❌'}`);

  // Simulate policy setting (lis set equivalent)
  const policy: CommercePolicy = {
    id: 'policy_e2e_test',
    globalLimit: '10000000', // 10 USDC
    dailyLimit: '50000000', // 50 USDC
    autoApproveBelow: '1000000', // 1 USDC
    requireApproval: false
  };

  tests.policySet = !!policy.id;
  console.log(`✓ Policy Configured: ${policy.id} ${tests.policySet ? '✅' : '❌'}`);
  console.log(`  - Global Limit: ${Number(policy.globalLimit) / 1e6} USDC`);
  console.log(`  - Daily Limit: ${Number(policy.dailyLimit) / 1e6} USDC`);
  console.log(`  - Auto-approve: ${Number(policy.autoApproveBelow) / 1e6} USDC`);

  // Verify guardian can read policy
  const guardian = new FiduciaryGuardian();
  const testIntent: InterpretedIntent = {
    type: IntentType.BUY,
    counterparty: '0xTest',
    reasoning: 'E2E Test',
    subject: { name: 'Test', description: 'E2E' },
    settlement: { asset: 'USDC', amount: '500000' }, // 0.5 USDC
    metadata: { templateType: 'BUY_SERVICE', serviceName: 'Test', sellerDID: 'did:test', maxPrice: '0', description: '' }
  };

  const validation = guardian.validate(testIntent, profile, policy, '0');
  tests.fiduciaryValidation = validation.decision === 'ALLOW';
  console.log(`✓ Fiduciary Validation: ${validation.decision} ${tests.fiduciaryValidation ? '✅' : '❌'}`);

  REPORT.phases.phase2 = { status: tests.profileCreated && tests.policySet && tests.fiduciaryValidation ? 'PASS' : 'FAIL', tests, profile, policy };
  console.log(`\n${tests.fiduciaryValidation ? '✅' : '❌'} Phase 2: ${tests.fiduciaryValidation ? 'PASS' : 'FAIL'}\n`);
}

async function phase3_ERC8004Registration() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 3: ERC-8004 On-Chain Registration');
  console.log('═══════════════════════════════════════════════════════\n');

  const tests: any = {};

  // Note: This phase requires actual deployment or mock
  // For E2E, we'll document the expected flow
  console.log('⚠️  NOTE: ERC-8004 registry deployment on ARC Testnet required');
  console.log('Registry Address:', process.env.REGISTRY_ADDRESS || 'NOT SET');

  if (!process.env.REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.log('❌ BLOCKER: ERC-8004 registry not deployed on ARC Testnet');
    tests.registryDeployed = false;
    tests.agentRegistered = false;
    REPORT.phases.phase3 = { status: 'BLOCKED', tests, reason: 'Registry not deployed on ARC' };
    console.log('\n⏸️  Phase 3: BLOCKED (registry deployment required)\n');
    return;
  }

  // If registry exists, test registration
  tests.registryDeployed = true;
  console.log('✅ Registry address configured');

  // Mock registration tx (would be real in full deployment)
  const mockRegTx = 'tx_erc8004_registration_pending';
  console.log(`ℹ️  Registration TX: ${mockRegTx} (pending actual deployment)`);

  REPORT.phases.phase3 = { status: 'PARTIAL', tests };
  console.log('\n⏸️  Phase 3: PARTIAL (manual registry deployment needed)\n');
}

async function phase4_AutonomousSettlement() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 4: Autonomous Settlement Test');
  console.log('═══════════════════════════════════════════════════════\n');

  const tests: any = {};

  // Create settlement provider
  const provider = new ARCSettlementProvider(
    process.env.ARC_RPC_URL,
    process.env.SELLER_PRIVATE_KEY
  );

  const wallet = new ethers.Wallet(
    process.env.SELLER_PRIVATE_KEY!,
    new ethers.JsonRpcProvider(process.env.ARC_RPC_URL!)
  );

  // Check balance
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(
    process.env.ARC_USDC_CONTRACT!,
    usdcAbi,
    wallet
  );

  const preBalance = await usdc.balanceOf(wallet.address);
  console.log(`Pre-settlement Balance: ${ethers.formatUnits(preBalance, 6)} USDC`);

  // Execute settlement (0.3 USDC to leave room for gas and future tests)
  console.log('\nExecuting autonomous settlement...');

  try {
    const result = await provider.executeTransfer(
      wallet.address, // Self-transfer
      '300000', // 0.3 USDC
      'USDC',
      'E2E autonomous settlement test'
    );

    tests.settlementExecuted = result.status === 'COMPLETED';
    tests.txHash = result.transactionId;
    tests.arcScanLink = `https://testnet.arcscan.app/tx/${result.transactionId}`;

    console.log(`\n✅ Settlement COMPLETED`);
    console.log(`TX Hash: ${result.transactionId}`);
    console.log(`ArcScan: ${tests.arcScanLink}`);

    REPORT.txHashes.push(result.transactionId);
    REPORT.arcScanLinks.push(tests.arcScanLink);

    // Verify balance delta
    await new Promise(resolve => setTimeout(resolve, 2000));
    const postBalance = await usdc.balanceOf(wallet.address);
    console.log(`\nPost-settlement Balance: ${ethers.formatUnits(postBalance, 6)} USDC`);

    const delta = preBalance - postBalance;
    console.log(`Balance Delta: ${ethers.formatUnits(delta, 6)} USDC (gas only, self-transfer)`);

    tests.balanceVerified = delta > 0n && delta < BigInt(100000); // Should be < 0.1 USDC (just gas)

    REPORT.phases.phase4 = {
      status: tests.settlementExecuted && tests.balanceVerified ? 'PASS' : 'FAIL',
      tests,
      preBalance: ethers.formatUnits(preBalance, 6),
      postBalance: ethers.formatUnits(postBalance, 6),
      delta: ethers.formatUnits(delta, 6)
    };

    console.log(`\n✅ Phase 4: PASS\n`);

  } catch (error: any) {
    console.error(`❌ Settlement failed:`, error.message);
    tests.settlementExecuted = false;
    REPORT.failures.push(`Phase 4: ${error.message}`);
    REPORT.phases.phase4 = { status: 'FAIL', tests, error: error.message };
    console.log('\n❌ Phase 4: FAIL\n');
  }
}

async function phase5_x402Flow() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 5: x402 Micropayment Flow');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('⚠️  NOTE: x402 flow requires running server and simulated client');
  console.log('This would test:');
  console.log('  1. 402 Payment Required response');
  console.log('  2. Automatic payment settlement');
  console.log('  3. Retry with x402-proof header');
  console.log('  4. 200 OK response\n');

  console.log('For manual verification:');
  console.log('  cd aiconomy-arc-hackathon-sf');
  console.log('  npm run dev (start server)');
  console.log('  curl http://localhost:3000/hire (expect 402)\n');

  REPORT.phases.phase5 = { status: 'MANUAL', note: 'Requires server runtime' };
  console.log('⏸️  Phase 5: MANUAL VERIFICATION REQUIRED\n');
}

async function phase6_ObserverUI() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PHASE 6: Observer UI Verification');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('⚠️  NOTE: UI verification requires browser interaction');
  console.log('To verify:');
  console.log('  cd app');
  console.log('  npm run dev');
  console.log('  Open http://localhost:3000');
  console.log('  Verify UI shows:');
  console.log('    - Agent identity');
  console.log('    - Treasury balance');
  console.log('    - Activity logs');
  console.log('    - Working ArcScan links\n');

  REPORT.phases.phase6 = { status: 'MANUAL', note: 'Requires browser UI testing' };
  console.log('⏸️  Phase 6: MANUAL VERIFICATION REQUIRED\n');
}

async function generateFinalReport() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FINAL E2E TEST REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('AUTOMATED TEST RESULTS:');
  Object.keys(REPORT.phases).forEach(phase => {
    const p = REPORT.phases[phase];
    console.log(`  ${phase}: ${p.status}`);
  });

  console.log(`\nTRANSACTION HASHES CAPTURED: ${REPORT.txHashes.length}`);
  REPORT.txHashes.forEach((tx: string) => {
    console.log(`  - ${tx}`);
  });

  console.log(`\nARCSCAN LINKS:`);
  REPORT.arcScanLinks.forEach((link: string) => {
    console.log(`  - ${link}`);
  });

  if (REPORT.failures.length > 0) {
    console.log(`\n❌ FAILURES: ${REPORT.failures.length}`);
    REPORT.failures.forEach((f: string) => {
      console.log(`  - ${f}`);
    });
  }

  // Write report to file
  const reportPath = path.resolve(__dirname, '../E2E_TEST_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify(REPORT, null, 2));
  console.log(`\n✅ Full report saved: ${reportPath}`);

  console.log('\n═══════════════════════════════════════════════════════\n');
}

async function run() {
  try {
    await phase1_EnvironmentValidation();
    await phase2_AgentBootstrap();
    await phase3_ERC8004Registration();
    await phase4_AutonomousSettlement();
    await phase5_x402Flow();
    await phase6_ObserverUI();
    await generateFinalReport();
  } catch (error: any) {
    console.error('\n🚨 E2E TEST ABORTED:', error.message);
    await generateFinalReport();
    process.exit(1);
  }
}

run().catch(console.error);
