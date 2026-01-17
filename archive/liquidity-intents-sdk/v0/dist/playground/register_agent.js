"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_resolver_1 = require("../discovery/contract-resolver");
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
dotenv_1.default.config();
async function main() {
    const rpcUrl = process.env.TESTNET_RPC_URL || 'https://sepolia.base.org';
    const registryAddress = process.env.REGISTRY_ADDRESS;
    const privateKey = process.env.SELLER_PRIVATE_KEY;
    if (!registryAddress || !privateKey) {
        console.error("Missing REGISTRY_ADDRESS or SELLER_PRIVATE_KEY in .env");
        process.exit(1);
    }
    console.log(`Connecting to Registry at ${registryAddress}...`);
    const resolver = new contract_resolver_1.ContractResolver(rpcUrl, registryAddress);
    const capability = 'LIP_TEXT';
    const minPrice = ethers_1.ethers.parseUnits('1', 'gwei').toString();
    try {
        console.log(`Registering Agent: Capability=${capability}, MinPrice=${minPrice} wei...`);
        const txHash = await resolver.register(privateKey, capability, minPrice);
        console.log("-----------------------------------------");
        console.log(`SUCCESS: Agent Registered!`);
        console.log(`Tx Hash: ${txHash}`);
        console.log("-----------------------------------------");
    }
    catch (e) {
        console.error("Registration Failed:", e);
    }
}
main();
