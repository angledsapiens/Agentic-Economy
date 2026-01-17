"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC8004Registry = void 0;
const abi_1 = require("./abi");
const uuid_1 = require("uuid");
const ethers_1 = require("ethers");
/**
 * ERC-8004 Registry Adapter
 *
 * Abstraction for interacting with the on-chain Service Manager contract.
 * Supports both LOCAL mock and live EVM networks (TESTNET).
 */
class ERC8004Registry {
    constructor(contractAddress, rpcUrl, privateKey) {
        this.provider = null;
        this.signer = null;
        // Mock Storage for Local Mode
        this.mockStore = new Map();
        this.mode = process.env.LIS_MODE || 'LOCAL';
        // Registry Address (Default to a known Base Sepolia deployment or 0x0)
        // For Sprint 4B we assume user provides via ENV or constructor
        this.contractAddress = contractAddress || process.env.REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';
        if (this.mode === 'TESTNET' && rpcUrl) {
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            if (privateKey) {
                this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
            }
        }
    }
    /**
     * Registers an agent on chain or in mock store.
     * @param descriptor The agent metadata
     * @returns Transaction Hash
     */
    async register(descriptor) {
        const metadataJson = JSON.stringify(descriptor);
        console.log(`[ERC8004] Registering agent: ${descriptor.name} (${descriptor.paymentAddress})`);
        // --- LOCAL MODE ---
        if (this.mode === 'LOCAL') {
            const id = descriptor.paymentAddress;
            this.mockStore.set(id, descriptor);
            return `tx_mock_${(0, uuid_1.v4)()}`;
        }
        // --- TESTNET MODE ---
        if (!this.signer || !this.contractAddress) {
            throw new Error('EVM Signer or Contract Address missing for TESTNET registration');
        }
        try {
            const contract = new ethers_1.ethers.Contract(this.contractAddress, abi_1.ServiceManagerABI, this.signer);
            console.log(`[ERC8004] Broadcasting tx to ${this.contractAddress}...`);
            const tx = await contract.register(metadataJson);
            console.log(`[ERC8004] Waiting for confirmation (Tx: ${tx.hash})...`);
            await tx.wait(1); // Wait for 1 block confirmation
            return tx.hash;
        }
        catch (e) {
            console.error('[ERC8004] Registration Failed:', e.message);
            throw e;
        }
    }
    /**
     * Finds agents possessing a specific capability.
     * Scans event logs in TESTNET mode or memory in LOCAL mode.
     * @param capability The capability tag to search for
     */
    async findAgents(capability) {
        console.log(`[ERC8004] Searching for capability: ${capability}`);
        // --- LOCAL MODE ---
        if (this.mode === 'LOCAL') {
            const results = [];
            for (const agent of this.mockStore.values()) {
                if (agent.capabilities.includes(capability)) {
                    results.push(agent);
                }
            }
            return results;
        }
        // --- TESTNET MODE ---
        if (!this.provider || !this.contractAddress) {
            console.warn('[ERC8004] Provider or Contract missing for discovery, returning empty.');
            return [];
        }
        try {
            const contract = new ethers_1.ethers.Contract(this.contractAddress, abi_1.ServiceManagerABI, this.provider);
            // Query 'ServiceRegistered' events
            // optimization: limit block range in production
            const filter = contract.filters.ServiceRegistered();
            const events = await contract.queryFilter(filter, -5000); // Look back 5000 blocks
            const results = [];
            for (const event of events) {
                if ('args' in event) {
                    try {
                        const metadataStr = event.args[2]; // arg[2] is string metadata
                        const descriptor = JSON.parse(metadataStr);
                        // Client-side filtering
                        if (descriptor.capabilities && descriptor.capabilities.includes(capability)) {
                            results.push(descriptor);
                        }
                    }
                    catch (parseError) {
                        // Ignore malformed metadata
                        continue;
                    }
                }
            }
            return results;
        }
        catch (e) {
            console.error('[ERC8004] Discovery Failed:', e.message);
            return [];
        }
    }
}
exports.ERC8004Registry = ERC8004Registry;
