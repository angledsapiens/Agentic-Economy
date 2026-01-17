"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.treasuryCommand = void 0;
const commander_1 = require("commander");
const manager_1 = require("../../../aiconomy-arc-hackathon-sf/src/treasury/manager");
const circle_provider_1 = require("../../../aiconomy-arc-hackathon-sf/src/settlement/circle-provider");
const prompts_1 = require("../lib/prompts");
const chalk_1 = __importDefault(require("chalk"));
exports.treasuryCommand = new commander_1.Command('treasury')
    .description('Inspect Treasury State')
    .action(async () => {
    (0, prompts_1.header)('Treasury Status');
    // Setup Managers
    const provider = new circle_provider_1.CircleSettlementProvider(); // Auto-loads ENV
    const manager = new manager_1.TreasuryManager(provider);
    const asset = 'USDC';
    (0, prompts_1.info)(`Fetching snapshot for ${asset}...\n`);
    const snapshot = await manager.getSnapshot(asset);
    console.log(chalk_1.default.bold('  Asset:     ') + snapshot.currency);
    console.log(chalk_1.default.bold('  Total:     ') + snapshot.totalBalance);
    console.log(chalk_1.default.bold('  Reserved:  ') + chalk_1.default.yellow(snapshot.reservedBalance));
    console.log(chalk_1.default.bold('  Available: ') + chalk_1.default.green(snapshot.availableBalance));
    console.log('\n' + chalk_1.default.dim(`Last Updated: ${new Date(snapshot.lastUpdated).toISOString()}`));
});
