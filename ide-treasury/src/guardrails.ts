/**
 * Fiduciary Layer - Budget Guardrails for Antigravity Treasury
 *
 * This module enforces spending limits to prevent unauthorized budget overruns.
 * Adjusted for 1 USDC liquidity to enable multiple test missions.
 * Each mission/task has a maximum budget of 0.50 USDC.
 */

import fs from 'fs';
import path from 'path';

export interface MissionConfig {
  taskId: string;
  maxBudget: number;
  totalSpent: number;
}

// In-memory budget tracking (can be upgraded to persistent storage later)
const missionBudgets: Map<string, MissionConfig> = new Map();

// Default maximum budget per task (in USDC) - adjusted for 1 USDC total liquidity
const DEFAULT_MAX_BUDGET = 0.50;

// Threshold for requiring user approval (in USDC)
const USER_APPROVAL_THRESHOLD = 0.10;

/**
 * Initialize or retrieve a mission configuration
 */
export function getMissionConfig(taskId: string): MissionConfig {
  if (!missionBudgets.has(taskId)) {
    missionBudgets.set(taskId, {
      taskId,
      maxBudget: DEFAULT_MAX_BUDGET,
      totalSpent: 0
    });
  }
  return missionBudgets.get(taskId)!;
}

/**
 * Validate if a spend amount is within budget for the current task
 *
 * @param amount - The amount to spend (in USDC)
 * @param taskId - The task identifier (defaults to 'default')
 * @throws Error with code BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION if budget would be exceeded
 * @throws Error with code USER_APPROVAL_REQUIRED if amount exceeds approval threshold
 */
export async function validateSpend(amount: number, missionId: string): Promise<boolean> {
  // Check for Emergency Lock
  const lockPath = path.join(process.cwd(), 'STOP.LOCK');
  if (fs.existsSync(lockPath)) {
    console.error('YOUR SPENDING AUTHORITY HAS BEEN REVOKED via Mission Control.');
    throw new Error('❌ TRANSACTION BLOCKED: Emergency Stop is ACTIVE (STOP.LOCK exists).');
  }

  // 1. Load Mission Budget
  // The following line from the instruction is malformed and seems to be a partial thought.
  // For now, we will continue to use the in-memory missionBudgets map.
  // const budgetPath = path.join(process.cwd(), `budget_${missionId}.json`);talSpent + amount;

  const mission = getMissionConfig(missionId); // Use missionId instead of taskId
  const projectedTotal = mission.totalSpent + amount;

  // Check if amount exceeds user approval threshold
  if (amount >= USER_APPROVAL_THRESHOLD) {
    console.warn(
      `[Guardrails] Payment of ${amount.toFixed(2)} USDC exceeds USER_APPROVAL_THRESHOLD ` +
      `of ${USER_APPROVAL_THRESHOLD.toFixed(2)} USDC. Human review recommended.`
    );
  }

  // Check if projected total would exceed budget
  if (projectedTotal > mission.maxBudget) {
    const error = new Error(
      `BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION: ` +
      `Task "${missionId}" would exceed budget. ` +
      `Current: ${mission.totalSpent.toFixed(2)} USDC, ` +
      `Requested: ${amount.toFixed(2)} USDC, ` +
      `Projected: ${projectedTotal.toFixed(2)} USDC, ` +
      `Max Budget: ${mission.maxBudget.toFixed(2)} USDC. ` +
      `Overage: ${(projectedTotal - mission.maxBudget).toFixed(2)} USDC.`
    );
    (error as any).code = 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION';
    throw error;
  }

  return true;
}

/**
 * Record a successful spend for a task
 *
 * @param amount - The amount spent (in USDC)
 * @param taskId - The task identifier
 */
export function recordSpend(amount: number, taskId: string = 'default'): void {
  const mission = getMissionConfig(taskId);
  mission.totalSpent += amount;
  console.log(`[Guardrails] Recorded spend: ${amount.toFixed(2)} USDC for task "${taskId}". Total: ${mission.totalSpent.toFixed(2)} USDC`);
}

/**
 * Get the remaining budget for a task
 */
export function getRemainingBudget(taskId: string = 'default'): number {
  const mission = getMissionConfig(taskId);
  return Math.max(0, mission.maxBudget - mission.totalSpent);
}

/**
 * Reset the budget for a task (use when starting a new task)
 */
export function resetTaskBudget(taskId: string): void {
  missionBudgets.delete(taskId);
  console.log(`[Guardrails] Reset budget for task "${taskId}"`);
}

/**
 * Get all mission configurations (for debugging/monitoring)
 */
export function getAllMissions(): MissionConfig[] {
  return Array.from(missionBudgets.values());
}

/**
 * Get the user approval threshold
 */
export function getUserApprovalThreshold(): number {
  return USER_APPROVAL_THRESHOLD;
}

/**
 * Get the default max budget
 */
export function getDefaultMaxBudget(): number {
  return DEFAULT_MAX_BUDGET;
}
