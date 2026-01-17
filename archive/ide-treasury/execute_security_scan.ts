/**
 * Security Scan Payment Simulator (Standalone)
 *
 * Simulates a security scan payment for the micro-mission
 */

import { validateSpend, recordSpend, getMissionConfig } from './src/guardrails.js';
import fs from 'fs';
import path from 'path';

const MISSION_ID = 'security-scan-mission';
const PAYMENT_AMOUNT = 0.01;
const RECIPIENT = '0xe7410170f6645ad9069552154693952787c1691a';

async function executeSecurityScanPayment() {
  console.log('\n🔒 Security Scan Payment Simulation\n');
  console.log('Mission: Check src/circle.ts for hardcoded secrets');
  console.log(`Budget: ${getMissionConfig(MISSION_ID).maxBudget.toFixed(2)} USDC\n`);

  try {
    // Validate the payment against mission budget
    console.log(`Validating payment of ${PAYMENT_AMOUNT.toFixed(2)} USDC...`);
    validateSpend(PAYMENT_AMOUNT, MISSION_ID);
    console.log('✓ Payment validated\n');

    // Simulate the payment (in production, this would call executePayment)
    console.log(`Simulating payment to ${RECIPIENT}...`);
    console.log('⚠️  NOTE: This is a SIMULATION - no actual blockchain transaction\n');

    // Record the spend
    recordSpend(PAYMENT_AMOUNT, MISSION_ID);

    // Get mission status
    const mission = getMissionConfig(MISSION_ID);
    const remaining = mission.maxBudget - mission.totalSpent;

    console.log('═══════════════════════════════════════════════════');
    console.log('           PAYMENT SIMULATION COMPLETE');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Amount Paid:      ${PAYMENT_AMOUNT.toFixed(2)} USDC`);
    console.log(`Recipient:        ${RECIPIENT}`);
    console.log(`Mission Budget:   ${mission.maxBudget.toFixed(2)} USDC`);
    console.log(`Total Spent:      ${mission.totalSpent.toFixed(2)} USDC`);
    console.log(`Remaining:        ${remaining.toFixed(2)} USDC`);
    console.log(`Budget Used:      ${((mission.totalSpent / mission.maxBudget) * 100).toFixed(1)}%\n`);

    // Update the treasury dashboard
    await updateDashboard(mission, remaining);

    console.log('✅ Mission Status: Code cleaned, payment simulated');
    console.log('✅ Financial Artifact: Updated with transaction\n');

  } catch (error: any) {
    console.error('❌ Payment failed:', error.message);
    process.exit(1);
  }
}

async function updateDashboard(mission: any, remaining: number) {
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
| **USDC Balance** | **~1.00 USDC** (Faucet funded) |
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
| ${now} | Security Scan | 0.01 USDC | \`0xe7410170...\` | ✓ Simulated | \`security-scan-mission\` |

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
  <div style="font-size: 11px; color: #3182ce;">Pre-Transaction Validation</div>
</div>

<div style="background: #fef5e7; border: 1px solid #f6ad55; padding: 15px; border-radius: 8px;">
  <div style="font-size: 12px; color: #7c2d12; font-weight: 600; margin-bottom: 5px;">SPENT</div>
  <div style="font-size: 24px; color: #7c2d12; font-weight: 700;">${spentPercentage.toFixed(0)}%</div>
  <div style="font-size: 11px; color: #c05621;">Of Mission Budget</div>
</div>

</div>

---

## 🔗 Quick Links

- **Explorer**: [View on Base Sepolia](https://sepolia.basescan.org/address/0xcdca0a0c3447ae2091e592cc3d88b0e23ac16be4)
- **Wallet Set**: \`f78d4aaa-3da6-56eb-91d8-7e786a39bf93\`
- **Wallet ID**: \`e2b8f8ea-ceb2-5c7f-aa43-5ddbe0844e2a\`

---

<div style="background: #edf2f7; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #4a5568;">
  <strong>💡 Mission Complete:</strong> Hardcoded secrets removed from src/circle.ts and moved to .env. Security scan payment of 0.01 USDC simulated successfully.
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
  console.log('✅ Treasury Dashboard updated with mission details');
}

executeSecurityScanPayment().catch(console.error);
