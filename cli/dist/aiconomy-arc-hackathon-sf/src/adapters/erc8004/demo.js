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
const registry_1 = require("./registry");
const adapter_1 = require("./adapter");
const profile_1 = require("../../core/profile");
const dotenv = __importStar(require("dotenv"));
// Load ENV vars
dotenv.config();
/**
 * Demo Script: ERC-8004 Live Discovery
 * Run with: npx ts-node src/adapters/erc8004/demo.ts
 */
async function runDemo() {
    const mode = process.env.LIS_MODE || 'LOCAL';
    console.log(`--- Starting ERC-8004 Demo [Mode: ${mode}] ---`);
    if (mode === 'TESTNET') {
        if (!process.env.EVM_PRIVATE_KEY || !process.env.REGISTRY_ADDRESS) {
            console.warn(' ! Missing EVM keys/address in .env. Falling back to Mock store logic if applicable.');
        }
        else {
            console.log(` ! Connecting to Registry at ${process.env.REGISTRY_ADDRESS}`);
        }
    }
    // 1. Setup Environment
    // Registry will automatically parse process.env.REGISTRY_ADDRESS etc inside constructor if not passed,
    // but we can pass explicitly if needed.
    const registry = new registry_1.ERC8004Registry(process.env.REGISTRY_ADDRESS, process.env.EVM_RPC_URL, // e.g. Base Sepolia RPC
    process.env.EVM_PRIVATE_KEY);
    const adapter = new adapter_1.ERC8004Adapter(registry);
    // 2. Create a Mock Agent Profile
    const agentProfile = {
        id: 'did:pkh:eip155:8453:0xDemoAgent',
        name: `Agent ${Date.now()}`, // Unique name for demo
        address: '0x1234567890123456789012345678901234567890',
        controlledBy: 'did:pkh:master-key',
        status: profile_1.ProfileStatus.ACTIVE,
        capabilities: ['LIP_TEXT_GEN', 'LIP_CODE_REVIEW'],
        activePolicyId: 'policy-001',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    // 3. Publish Agent to Registry
    try {
        console.log('\n[1] Publishing Agent Profile...');
        const txId = await adapter.publish(agentProfile);
        console.log(` > Registration Successful. Tx ID: ${txId}`);
    }
    catch (e) {
        console.error(` > Registration Failed: ${e.message}`);
    }
    // 4. Discover Agents by Capability
    try {
        console.log('\n[2] Discovering Agents with capability "LIP_TEXT_GEN"...');
        const foundAgents = await adapter.discover('LIP_TEXT_GEN');
        if (foundAgents.length > 0) {
            console.log(` > Found ${foundAgents.length} agent(s):`);
            foundAgents.slice(0, 5).forEach(a => {
                console.log(`   - ${a.name} (${a.paymentAddress}) [${a.capabilities.join(', ')}]`);
            });
        }
        else {
            console.warn(' > No agents found!');
        }
    }
    catch (e) {
        console.error(` > Discovery Failed: ${e.message}`);
    }
    console.log('\n--- Demo Complete ---');
}
runDemo().catch(console.error);
