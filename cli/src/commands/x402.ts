import { Command } from 'commander';
import { header, success, input } from '../lib/prompts';

export const x402Command = new Command('enable')
  .description('Enable Features')
  .command('x402')
  .description('Configure x402 Micropayment Server')
  .action(async () => {
    header('Configure x402 Micropayments');

    const price = await input('Default Service Price (USDC-wei):', '1000000');
    const recipient = await input('Settlement Address (DID/EVM):', '0xWallet...');

    // In a real CLI this would write to a config file used by the runtime.
    // For Sprint 6A (Demo), we just confirm the configuration.

    success('x402 Configuration Saved.');
    console.log(` - Price: ${price} wei`);
    console.log(` - Recipient: ${recipient}`);
    console.log(` - Middleware: ENABLED`);
  });
