"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_resolver_1 = require("../discovery/contract-resolver");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const rpcUrl = process.env.TESTNET_RPC_URL || 'https://sepolia.base.org';
    const registryAddress = process.env.REGISTRY_ADDRESS;
    if (!registryAddress) {
        console.error("Missing REGISTRY_ADDRESS");
        return;
    }
    console.log(`Querying Registry at ${registryAddress}...`);
    const resolver = new contract_resolver_1.ContractResolver(rpcUrl, registryAddress);
    const capability = 'LIP_TEXT';
    try {
        const agents = await resolver.getAgents(capability);
        console.log(`Found ${agents.length} agents for ${capability}:`);
        console.log(JSON.stringify(agents, null, 2));
    }
    catch (e) {
        console.error("Query Failed:", e);
    }
}
main();
