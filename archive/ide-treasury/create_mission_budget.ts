/**
 * Mission Budget Manager
 *
 * Creates and manages budgets for specific missions/tasks
 */

import { getMissionConfig, resetTaskBudget } from './src/guardrails.js';

export function createMissionBudget(taskId: string, budget: number): void {
  // Reset any existing budget for this task
  resetTaskBudget(taskId);

  // Create new mission with custom budget
  const mission = getMissionConfig(taskId);
  mission.maxBudget = budget;
  mission.totalSpent = 0;

  console.log(`\n🎯 Mission Budget Created`);
  console.log(`   Task ID: ${taskId}`);
  console.log(`   Budget: ${budget.toFixed(2)} USDC`);
  console.log(`   Status: Active\n`);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const taskId = process.argv[2] || 'default';
  const budget = parseFloat(process.argv[3]) || 0.50;
  createMissionBudget(taskId, budget);
}
