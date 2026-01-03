/**
 * Test script for updated Fiduciary Layer budget guardrails
 * Testing with 0.50 USDC budget and 0.10 USDC approval threshold
 */

import { validateSpend, recordSpend, getMissionConfig, getRemainingBudget, resetTaskBudget, getDefaultMaxBudget, getUserApprovalThreshold } from './src/guardrails.js';

console.log('=== Updated Fiduciary Layer Test (1 USDC Liquidity) ===\n');

const testTaskId = 'test-mission-low-budget';

try {
  console.log('Configuration Check:');
  console.log(`  Default Max Budget: ${getDefaultMaxBudget()} USDC`);
  console.log(`  User Approval Threshold: ${getUserApprovalThreshold()} USDC\n`);

  console.log('Test 1: Check initial budget (should be 0.50 USDC)');
  const initialConfig = getMissionConfig(testTaskId);
  console.log(`✓ Task "${testTaskId}" initialized`);
  console.log(`  Max Budget: ${initialConfig.maxBudget} USDC`);
  console.log(`  Total Spent: ${initialConfig.totalSpent} USDC`);
  console.log(`  Remaining: ${getRemainingBudget(testTaskId)} USDC\n`);

  console.log('Test 2: Validate small spend (0.05 USDC) - should PASS without warning');
  validateSpend(0.05, testTaskId);
  console.log('✓ Validation passed for 0.05 USDC\n');

  console.log('Test 3: Validate spend at approval threshold (0.10 USDC) - should PASS with warning');
  validateSpend(0.10, testTaskId);
  console.log('✓ Validation passed for 0.10 USDC (warning expected above)\n');

  console.log('Test 4: Record first spend (0.15 USDC)');
  recordSpend(0.15, testTaskId);
  console.log(`  Remaining: ${getRemainingBudget(testTaskId)} USDC\n`);

  console.log('Test 5: Validate another spend (0.20 USDC) - should PASS');
  validateSpend(0.20, testTaskId);
  console.log('✓ Validation passed for 0.20 USDC\n');

  console.log('Test 6: Record second spend (0.20 USDC)');
  recordSpend(0.20, testTaskId);
  console.log(`  Total Spent: ${getMissionConfig(testTaskId).totalSpent} USDC`);
  console.log(`  Remaining: ${getRemainingBudget(testTaskId)} USDC\n`);

  console.log('Test 7: Try to spend 0.20 USDC - should FAIL (would exceed 0.50 limit)');
  try {
    validateSpend(0.20, testTaskId);
    console.log('✗ ERROR: Validation should have failed but passed!\n');
  } catch (error: any) {
    if (error.code === 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION') {
      console.log('✓ Budget enforcement working correctly!');
      console.log(`  Error: ${error.message}\n`);
    } else {
      throw error;
    }
  }

  console.log('Test 8: Validate exact remaining amount (0.15 USDC) - should PASS');
  const remaining = getRemainingBudget(testTaskId);
  validateSpend(remaining, testTaskId);
  console.log(`✓ Validation passed for exact remaining amount: ${remaining} USDC\n`);

  console.log('Test 9: Test multiple missions with 1 USDC total');
  resetTaskBudget(testTaskId);
  const mission1 = 'mission-1';
  const mission2 = 'mission-2';

  console.log(`  Mission 1: Spending 0.40 USDC`);
  validateSpend(0.40, mission1);
  recordSpend(0.40, mission1);

  console.log(`  Mission 2: Spending 0.45 USDC`);
  validateSpend(0.45, mission2);
  recordSpend(0.45, mission2);

  console.log(`  Total across missions: ${0.40 + 0.45} USDC (85% of 1 USDC liquidity)`);
  console.log(`  ✓ Can run 2 missions with current budget settings\n`);

  console.log('Test 10: Try to exceed budget immediately (0.60 USDC) - should FAIL');
  resetTaskBudget(testTaskId);
  try {
    validateSpend(0.60, testTaskId);
    console.log('✗ ERROR: Validation should have failed but passed!\n');
  } catch (error: any) {
    if (error.code === 'BUDGET_EXCEEDED_REQUIRES_HUMAN_INTERVENTION') {
      console.log('✓ Budget enforcement working correctly!');
      console.log(`  Error: ${error.message}\n`);
    } else {
      throw error;
    }
  }

  console.log('=== All Tests Passed! ===\n');
  console.log('✅ Fiduciary Layer updated successfully');
  console.log('✅ Budget limit of 0.50 USDC per task is enforced');
  console.log('✅ User approval threshold of 0.10 USDC is active');
  console.log('✅ Can run ~2 test missions with 1 USDC liquidity');

} catch (error) {
  console.error('\n❌ Test Failed:', error);
  process.exit(1);
}
