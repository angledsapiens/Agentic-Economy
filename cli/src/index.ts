import { Command } from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import { initCommand } from './commands/init';
import { policyCommand } from './commands/policy';
import { publishCommand } from './commands/publish';
import { x402Command } from './commands/x402';
import { treasuryCommand } from './commands/treasury';

// Load Env
dotenv.config();

const program = new Command();

console.log(chalk.blue(figlet.textSync('LIS CLI', { horizontalLayout: 'full' })));
console.log(chalk.dim('Agentic Economy Dev Tools v1.0\n'));

program
  .version('1.0.0')
  .description('Liquidity Intents SDK - Developer CLI');

// Register Commands
program.addCommand(initCommand);
program.addCommand(policyCommand);
program.addCommand(publishCommand);
program.addCommand(x402Command);
program.addCommand(treasuryCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
