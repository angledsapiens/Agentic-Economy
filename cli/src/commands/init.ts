import { Command } from 'commander';
import { ProfileStore } from '../../../aiconomy-arc-hackathon-sf/src/persistence/store';
import { CommerceProfile, ProfileStatus } from '../../../aiconomy-arc-hackathon-sf/src/core/profile';
import { header, success, info, input, confirm } from '../lib/prompts';
import { v4 as uuidv4 } from 'uuid';

export const initCommand = new Command('init')
  .description('Initialize Commerce Profile')
  .action(async () => {
    header('Initialize LIS Agent');

    const store = new ProfileStore('profiles.json');
    const existing = await store.load();

    if (existing) {
      info(`Found existing profile: ${existing.name} (${existing.id})`);
      const overwrite = await confirm('Do you want to overwrite this profile?');
      if (!overwrite) {
        success('Using existing profile.');
        return;
      }
    }

    // CREATE Flow
    const name = await input('Agent Name:', 'Autonomous Trader');
    const address = await input('Wallet Address (EVM):', '0x123...');

    // Auto-generate DID
    const id = `did:lis:${uuidv4().split('-')[0]}`;

    const newProfile: CommerceProfile = {
      id,
      name,
      address,
      controlledBy: 'user', // CLI user
      status: ProfileStatus.ACTIVE,
      capabilities: ['LIP_TRADING', 'LIP_PAYMENTS'],
      activePolicyId: 'default-policy',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await store.save(newProfile);
    success(`Created Agent Profile: ${name}`);
    info(`ID: ${id}`);
  });
