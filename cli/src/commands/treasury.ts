import { Command } from 'commander';
import { TreasuryManager } from '../../../aiconomy-arc-hackathon-sf/src/treasury/manager';
import { CircleSettlementProvider } from '../../../aiconomy-arc-hackathon-sf/src/settlement/circle-provider';
import { header, info } from '../lib/prompts';
import chalk from 'chalk';

export const treasuryCommand = new Command('treasury')
  .description('Inspect Treasury State')
  .action(async () => {
    header('Treasury Status');

    // Setup Managers
    const provider = new CircleSettlementProvider(); // Auto-loads ENV
    const manager = new TreasuryManager(provider);

    const asset = 'USDC';
    info(`Fetching snapshot for ${asset}...\n`);

    const snapshot = await manager.getSnapshot(asset);

    console.log(chalk.bold('  Asset:     ') + snapshot.currency);
    console.log(chalk.bold('  Total:     ') + snapshot.totalBalance);
    console.log(chalk.bold('  Reserved:  ') + chalk.yellow(snapshot.reservedBalance));
    console.log(chalk.bold('  Available: ') + chalk.green(snapshot.availableBalance));

    console.log('\n' + chalk.dim(`Last Updated: ${new Date(snapshot.lastUpdated).toISOString()}`));
  });
