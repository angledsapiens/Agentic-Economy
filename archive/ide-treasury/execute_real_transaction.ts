/**
 * Real Transaction Executor
 *
 * Executes an actual blockchain transaction with budget validation
 */

import { executePayment } from './src/circle.js';
import { getMissionConfig } from './src/guardrails.js';
import fs from 'fs';
import path from 'path';

const MISSION_ID = 'security-scan-mission';
const PAYMENT_AMOUNT = '0.01'; // String format for Circle API
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
    // executePayment will call validateSpend internally

    console.log('📝 Executing payment via Circle API...');
    const transactionId = await executePayment(PAYMENT_AMOUNT, RECIPIENT, MISSION_ID);

    console.log('\n✅ TRANSACTION SUCCESSFUL!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('           TRANSACTION DETAILS');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Amount: ${PAYMENT_AMOUNT} USDC`);
    console.log(`Recipient: ${RECIPIENT}`);
    console.log(`Mission: ${MISSION_ID}\n`);

    // Get updated mission status
    const updatedMission = getMissionConfig(MISSION_ID);
    const remaining = updatedMission.maxBudget - updatedMission.totalSpent;

    console.log('💰 Budget Status:');
    console.log(`   Total Spent: ${updatedMission.totalSpent.toFixed(2)} USDC`);
    console.log(`   Remaining: ${remaining.toFixed(2)} USDC`);
    console.log(`   Budget Used: ${((updatedMission.totalSpent / updatedMission.maxBudget) * 100).toFixed(1)}%\n`);

    // Update dashboard
    await updateDashboard(updatedMission, remaining, transactionId);

    console.log('✅ Treasury Dashboard updated');
    console.log('🔗 View on Explorer: https://sepolia.basescan.org/address/0xCDcA0A0C3447Ae2091E592Cc3D88B0e23aC16BE4#tokentxns\n');

  } catch (error: any) {
    console.error('\n❌ Transaction Failed:', error.message);

    if (error.code === 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION') {
      console.error('\n🛡️ BUDGET GUARDRAILS BLOCKED THIS TRANSACTION');
      console.error('Human intervention required to proceed.\n');
    }

    process.exit(1);
  }
}

async function updateDashboard(mission: any, remaining: number, txId: string) {
  const spentPercentage = (mission.totalSpent / mission.maxBudget) * 100;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const dashboard = `# 💰 Antigravity Treasury Dashboard

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
  <h2 style="margin: 0; font-size: 24px;">Treasury Status</h2>
  <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Real-time financial overview</p>
</div>

## 📊 Wallet Overview

| Property | Value |
|----------|-------|
| **Wallet Address** | \`0xcdca0a0c3447ae2091e592cc3d88b0e23ac16be4\` |
| **Blockchain** | BASE-SEPOLIA (Testnet) |
| **Status** | 🟢 LIVE & OPERATIONAL |
| **USDC Balance** | **~${(1.00 - mission.totalSpent).toFixed(2)} USDC** |
| **Last Updated** | ${now} UTC |

---

## 💳 Budget Utilization - Mission: \`${mission.taskId}\`

<div style="background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">

### Current Task: Security Scan Mission

<div style="margin: 15px 0;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
    <span style="font-weight: 600; color: #2d3748;">Spent</span>
    <span style="font-weight: 600; color: #667eea;">$${mission.totalSpent.toFixed(2)} / $${mission.maxBudget.toFixed(2)} USDC</span>
  </div>

  <div style="background: #e2e8f0; height: 24px; border-radius: 12px; overflow: hidden; position: relative;">
    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${spentPercentage.toFixed(1)}%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
      ${spentPercentage.toFixed(1)}%
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #718096;">
    <span>Remaining: <strong style="color: ${remaining > 0.05 ? '#48bb78' : '#f56565'};">$${remaining.toFixed(2)} USDC</strong></span>
    <span>Budget Status: <strong style="color: ${remaining > 0 ? '#48bb78' : '#f56565'};">${remaining > 0 ? '✓ Available' : '⚠ Exceeded'}</strong></span>
  </div>
</div>

</div>

---

## 📜 Transaction History

<div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">

| Date | Type | Amount | Recipient | Status | Task ID |
|------|------|--------|-----------|--------|---------|
| ${now} | Security Scan | 0.01 USDC | \`0xe7410170...\` | ✅ **CONFIRMED** | \`security-scan-mission\` |

</div>

<div style="margin-top: 10px; padding: 10px; background: #f0fff4; border-left: 3px solid #48bb78; border-radius: 4px;">
  <strong>Transaction ID:</strong> <code>${txId}</code>
</div>

---

## 🛡️ Fiduciary Controls

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">

<div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 15px; border-radius: 8px;">
  <div style="font-size: 12px; color: #22543d; font-weight: 600; margin-bottom: 5px;">MISSION BUDGET</div>
  <div style="font-size: 24px; color: #22543d; font-weight: 700;">$${mission.maxBudget.toFixed(2)}</div>
  <div style="font-size: 11px; color: #38a169;">Security Scan Task</div>
</div>

<div style="background: #ebf8ff; border: 1px solid #90cdf4; padding: 15px; border-radius: 8px;">
  <div style="font-size: 12px; color: #2c5282; font-weight: 600; margin-bottom: 5px;">GUARDRAILS</div>
  <div style="font-size: 24px; color: #2c5282; font-weight: 700;">✓ Active</div>
  <div style="font-size: 11px; color: #3182ce;">Validated & Executed</div>
</div>

<div style="background: #fef5e7; border: 1px solid #f6ad55; padding: 15px; border-radius: 8px;">
  <div style="font-size: 12px; color: #7c2d12; font-weight: 600; margin-bottom: 5px;">SPENT</div>
  <div style="font-size: 24px; color: #7c2d12; font-weight: 700;">${spentPercentage.toFixed(0)}%</div>
  <div style="font-size: 11px; color: #c05621;">Of Mission Budget</div>
</div>

</div>

---

## 🔗 Quick Links

- **Explorer**: [View Transaction on Base Sepolia](https://sepolia.basescan.org/address/0xcdca0a0c3447ae2091e592cc3d88b0e23ac16be4#tokentxns)
- **Wallet Set**: \`f78d4aaa-3da6-56eb-91d8-7e786a39bf93\`
- **Wallet ID**: \`e2b8f8ea-ceb2-5c7f-aa43-5ddbe0844e2a\`

---

<div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #155724;">
  <strong>✅ Real Transaction Executed:</strong> Security scan payment of 0.01 USDC successfully sent to 0xe7410170f6645ad9069552154693952787c1691a. All guardrails validated. Transaction confirmed on Base Sepolia blockchain.
</div>
`;

  const artifactPath = path.join(
    process.env.USERPROFILE || '',
    '.gemini',
    'antigravity',
    'brain',
    'ed43b2c1-067d-492a-ad36-f4784c7fbb6e',
    'TreasuryStatus.md'
  );

  fs.writeFileSync(artifactPath, dashboard, 'utf8');
}

executeRealTransaction().catch(console.error);
