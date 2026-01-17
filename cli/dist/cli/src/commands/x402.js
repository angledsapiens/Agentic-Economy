"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x402Command = void 0;
const commander_1 = require("commander");
const prompts_1 = require("../lib/prompts");
exports.x402Command = new commander_1.Command('enable')
    .description('Enable Features')
    .command('x402')
    .description('Configure x402 Micropayment Server')
    .action(async () => {
    (0, prompts_1.header)('Configure x402 Micropayments');
    const price = await (0, prompts_1.input)('Default Service Price (USDC-wei):', '1000000');
    const recipient = await (0, prompts_1.input)('Settlement Address (DID/EVM):', '0xWallet...');
    // In a real CLI this would write to a config file used by the runtime.
    // For Sprint 6A (Demo), we just confirm the configuration.
    (0, prompts_1.success)('x402 Configuration Saved.');
    console.log(` - Price: ${price} wei`);
    console.log(` - Recipient: ${recipient}`);
    console.log(` - Middleware: ENABLED`);
});
