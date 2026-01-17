"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = exports.select = exports.confirm = exports.error = exports.info = exports.success = exports.header = exports.clearScreen = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * UX Helpers for LIS CLI
 */
const clearScreen = () => {
    process.stdout.write('\x1Bc');
};
exports.clearScreen = clearScreen;
const header = (text) => {
    console.log(chalk_1.default.bold.blue('\n' + text.toUpperCase()));
    console.log(chalk_1.default.dim('='.repeat(text.length)));
};
exports.header = header;
const success = (text) => {
    console.log(chalk_1.default.green(`✔ ${text}`));
};
exports.success = success;
const info = (text) => {
    console.log(chalk_1.default.cyan(`ℹ ${text}`));
};
exports.info = info;
const error = (text) => {
    console.log(chalk_1.default.red(`✖ ${text}`));
};
exports.error = error;
const confirm = async (message) => {
    const { result } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'result',
            message: chalk_1.default.yellow(message),
            default: true,
        },
    ]);
    return result;
};
exports.confirm = confirm;
const select = async (message, choices) => {
    const { result } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'result',
            message,
            choices,
        },
    ]);
    return result;
};
exports.select = select;
const input = async (message, defaultValue) => {
    const { result } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'result',
            message,
            default: defaultValue,
        },
    ]);
    return result;
};
exports.input = input;
