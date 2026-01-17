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
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishCommand = void 0;
const commander_1 = require("commander");
const adapter_1 = require("../../../aiconomy-arc-hackathon-sf/src/adapters/erc8004/adapter");
const registry_1 = require("../../../aiconomy-arc-hackathon-sf/src/adapters/erc8004/registry");
const store_1 = require("../../../aiconomy-arc-hackathon-sf/src/persistence/store");
const prompts_1 = require("../lib/prompts");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.publishCommand = new commander_1.Command('publish')
    .description('Publish Agent to On-Chain Registry')
    .command('erc8004')
    .description('Register via ERC-8004 (Service Manager)')
    .action(async () => {
    (0, prompts_1.header)('Publish Agent (ERC-8004)');
    // 1. Load Profile
    const store = new store_1.ProfileStore('profiles.json');
    const profile = await store.load();
    if (!profile) {
        (0, prompts_1.error)('No profile found. Run "lis init" first.');
        return;
    }
    (0, prompts_1.info)(`Selected Agent: ${profile.name}`);
    // 2. Setup Registry
    const mode = process.env.LIS_MODE || 'LOCAL';
    (0, prompts_1.info)(`Mode: ${mode}`);
    const registry = new registry_1.ERC8004Registry(process.env.REGISTRY_ADDRESS || '', process.env.EVM_RPC_URL || '', process.env.EVM_PRIVATE_KEY || '');
    const adapter = new adapter_1.ERC8004Adapter(registry);
    // 3. Publish
    try {
        (0, prompts_1.info)(`Publishing ${profile.name}...`);
        const tx = await adapter.publish(profile);
        (0, prompts_1.success)(`Successfully Registered!`);
        (0, prompts_1.info)(`Tx Hash: ${tx}`);
    }
    catch (e) {
        (0, prompts_1.error)(`Registration Failed: ${e.message}`);
    }
});
