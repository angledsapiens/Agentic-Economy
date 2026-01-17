"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyCommand = void 0;
const commander_1 = require("commander");
const store_1 = require("../../../aiconomy-arc-hackathon-sf/src/persistence/store");
const prompts_1 = require("../lib/prompts");
exports.policyCommand = new commander_1.Command('policy')
    .description('Manage Commerce Policies')
    .command('set')
    .description('Configure spend limits')
    .action(async () => {
    (0, prompts_1.header)('Configure Commerce Policy');
    const store = new store_1.PolicyStore('policies.json');
    let policy = await store.load();
    if (!policy) {
        // Create Default if missing
        policy = {
            id: 'default-policy',
            version: '1.0.0',
            name: 'Standard Limits',
            globalLimit: '10000000', // 10 USDC
            dailyLimit: '1000000', // 1 USDC
            autoApproveBelow: '100000', // 0.1 USDC
            requireApproval: true,
            minReputation: 0
        };
    }
    console.log(`Current Daily Limit: ${policy.dailyLimit} wei`);
    const newLimit = await (0, prompts_1.input)('New Daily Limit (wei -> 1000000 = 1 USDC):', policy.dailyLimit);
    policy.dailyLimit = newLimit;
    const autoApprove = await (0, prompts_1.input)('Auto-Approve Threshold (wei):', policy.autoApproveBelow);
    policy.autoApproveBelow = autoApprove;
    await store.save(policy);
    (0, prompts_1.success)(`Updated Policy: ${policy.name}`);
});
