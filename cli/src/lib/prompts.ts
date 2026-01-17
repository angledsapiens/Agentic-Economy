import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * UX Helpers for LIS CLI
 */

export const clearScreen = () => {
  process.stdout.write('\x1Bc');
};

export const header = (text: string) => {
  console.log(chalk.bold.blue('\n' + text.toUpperCase()));
  console.log(chalk.dim('='.repeat(text.length)));
};

export const success = (text: string) => {
  console.log(chalk.green(`✔ ${text}`));
};

export const info = (text: string) => {
  console.log(chalk.cyan(`ℹ ${text}`));
};

export const error = (text: string) => {
  console.log(chalk.red(`✖ ${text}`));
};

export const confirm = async (message: string): Promise<boolean> => {
  const { result } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'result',
      message: chalk.yellow(message),
      default: true,
    },
  ]);
  return result;
};

export const select = async (message: string, choices: string[]): Promise<string> => {
  const { result } = await inquirer.prompt([
    {
      type: 'list',
      name: 'result',
      message,
      choices,
    },
  ]);
  return result;
};

export const input = async (message: string, defaultValue?: string): Promise<string> => {
  const { result } = await inquirer.prompt([
    {
      type: 'input',
      name: 'result',
      message,
      default: defaultValue,
    },
  ]);
  return result;
};
