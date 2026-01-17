"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const chalk_1 = __importDefault(require("chalk"));
const dotenv = __importStar(require("dotenv"));
const init_1 = require("./commands/init");
const policy_1 = require("./commands/policy");
const publish_1 = require("./commands/publish");
const x402_1 = require("./commands/x402");
const treasury_1 = require("./commands/treasury");
// Load Env
dotenv.config();
const program = new commander_1.Command();
console.log(chalk_1.default.blue(figlet_1.default.textSync('LIS CLI', { horizontalLayout: 'full' })));
console.log(chalk_1.default.dim('Agentic Economy Dev Tools v1.0\n'));
program
    .version('1.0.0')
    .description('Liquidity Intents SDK - Developer CLI');
// Register Commands
program.addCommand(init_1.initCommand);
program.addCommand(policy_1.policyCommand);
program.addCommand(publish_1.publishCommand);
program.addCommand(x402_1.x402Command);
program.addCommand(treasury_1.treasuryCommand);
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
