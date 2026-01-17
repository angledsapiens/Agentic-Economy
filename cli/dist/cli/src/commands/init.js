"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = void 0;
const commander_1 = require("commander");
const store_1 = require("../../../aiconomy-arc-hackathon-sf/src/persistence/store");
const profile_1 = require("../../../aiconomy-arc-hackathon-sf/src/core/profile");
const prompts_1 = require("../lib/prompts");
const uuid_1 = require("uuid");
exports.initCommand = new commander_1.Command('init')
    .description('Initialize Commerce Profile')
    .action(async () => {
    (0, prompts_1.header)('Initialize LIS Agent');
    const store = new store_1.ProfileStore('profiles.json');
    const existing = await store.load();
    if (existing) {
        (0, prompts_1.info)(`Found existing profile: ${existing.name} (${existing.id})`);
        const overwrite = await (0, prompts_1.confirm)('Do you want to overwrite this profile?');
        if (!overwrite) {
            (0, prompts_1.success)('Using existing profile.');
            return;
        }
    }
    // CREATE Flow
    const name = await (0, prompts_1.input)('Agent Name:', 'Autonomous Trader');
    const address = await (0, prompts_1.input)('Wallet Address (EVM):', '0x123...');
    // Auto-generate DID
    const id = `did:lis:${(0, uuid_1.v4)().split('-')[0]}`;
    const newProfile = {
        id,
        name,
        address,
        controlledBy: 'user', // CLI user
        status: profile_1.ProfileStatus.ACTIVE,
        capabilities: ['LIP_TRADING', 'LIP_PAYMENTS'],
        activePolicyId: 'default-policy',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    await store.save(newProfile);
    (0, prompts_1.success)(`Created Agent Profile: ${name}`);
    (0, prompts_1.info)(`ID: ${id}`);
});
