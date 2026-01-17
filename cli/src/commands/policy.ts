import { Command } from 'commander';
import { PolicyStore } from '../../../aiconomy-arc-hackathon-sf/src/persistence/store';
import { CommercePolicy } from '../../../aiconomy-arc-hackathon-sf/src/core/profile'; // Policy is defined here in v1
import { header, success, input } from '../lib/prompts';

export const policyCommand = new Command('policy')
  .description('Manage Commerce Policies')
  .command('set')
  .description('Configure spend limits')
  .action(async () => {
    header('Configure Commerce Policy');

    const store = new PolicyStore('policies.json');
    await store.load();

    // In a real CLI we would select the policy ID.
    // For Sprint 6A (MVP) we edit the 'default-policy'.
    const policyId = 'default-policy';
    let policy = await store.get(policyId);

    if (!policy) {
      // Create Default if missing
      policy = {
        id: policyId,
        version: '1.0.0',
        name: 'Standard Limits',
        globalLimit: '10000000', // 10 USDC
        dailyLimit: '1000000',   // 1 USDC
        autoApproveBelow: '100000', // 0.1 USDC
        requireApproval: true,
        minReputation: 0
      };
    }

    console.log(`Current Daily Limit: ${policy.dailyLimit} wei`);

    const newLimit = await input('New Daily Limit (wei -> 1000000 = 1 USDC):', policy.dailyLimit);
    policy.dailyLimit = newLimit;

    const autoApprove = await input('Auto-Approve Threshold (wei):', policy.autoApproveBelow);
    policy.autoApproveBelow = autoApprove;

    await store.save(policy);
    success(`Updated Policy: ${policy.name}`);
  });
