/**
 * JSON Status Generator for Mission Control Extension
 */
import { getMissionConfig } from './src/guardrails.js';
import { getAgentBalance } from './src/circle.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Fallback to .env.test for Codespaces/Testing
if (!process.env.CIRCLE_API_KEY) {
  dotenv.config({ path: '.env.test' });
}

async function getStatus() {
  let balance = "0.00";
  try {
    const balanceStr = await getAgentBalance();
    balance = balanceStr.replace(' USDC', '');
  } catch (e) {
    balance = "-1"; // Signal error state
  }

  const mission = getMissionConfig('security-scan-mission');

  // Calculate Burn Rate (mock logic for PoC)
  // In real app, this would be moving average of recent txs
  const startTime = new Date().setHours(new Date().getHours() - 1); // 1 hr ago
  const hoursRunning = (Date.now() - startTime) / 3600000;
  const burnRate = mission.totalSpent / Math.max(hoursRunning, 1);

  const status = {
    balance: parseFloat(balance),
    maxBalance: 5.00,
    totalSpent: mission.totalSpent,
    budget: mission.maxBudget,
    burnRate: burnRate,
    isLocked: fs.existsSync(path.join(process.cwd(), 'STOP.LOCK')),
    lastUpdated: new Date().toISOString()
  };

  console.log('<<<JSON_START>>>');
  console.log(JSON.stringify(status));
  console.log('<<<JSON_END>>>');
}

getStatus().catch(console.error);
