import { Command } from 'commander';
import { ERC8004Adapter } from '../../../aiconomy-arc-hackathon-sf/src/adapters/erc8004/adapter';
import { ERC8004Registry } from '../../../aiconomy-arc-hackathon-sf/src/adapters/erc8004/registry';
import { ProfileStore } from '../../../aiconomy-arc-hackathon-sf/src/persistence/store';
import { header, success, info, error, select } from '../lib/prompts';
import * as dotenv from 'dotenv';

dotenv.config();

export const publishCommand = new Command('publish')
  .description('Publish Agent to On-Chain Registry')
  .command('erc8004')
  .description('Register via ERC-8004 (Service Manager)')
  .action(async () => {
    header('Publish Agent (ERC-8004)');

    // 1. Load Profile
    const store = new ProfileStore('profiles.json');
    await store.load();
    const ids = await store.getAllIds();

    if (ids.length === 0) {
      error('No profiles found. Run "lis init" first.');
      return;
    }

    const id = await select('Select Agent to Publish:', ids);
    const profile = await store.get(id);

    if (!profile) return;

    // 2. Setup Registry
    // In CLI mode, we assume user might have ENV vars or we default to local
    const mode = process.env.LIS_MODE || 'LOCAL';
    info(`Mode: ${mode}`);

    const registry = new ERC8004Registry(
      process.env.REGISTRY_ADDRESS,
      process.env.EVM_RPC_URL,
      process.env.EVM_PRIVATE_KEY
    );

    const adapter = new ERC8004Adapter(registry);

    // 3. Publish
    try {
      info(`Publishing ${profile.name}...`);
      const tx = await adapter.publish(profile);
      success(`Successfully Registered!`);
      info(`Tx Hash: ${tx}`);
    } catch (e: any) {
      error(`Registration Failed: ${e.message}`);
    }
  });
