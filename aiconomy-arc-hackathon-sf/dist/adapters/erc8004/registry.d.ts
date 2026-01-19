import { AgentDescriptor } from './types';
/**
 * ERC-8004 Registry Adapter
 *
 * Abstraction for interacting with the on-chain Service Manager contract.
 * Supports both LOCAL mock and live EVM networks (TESTNET).
 */
export declare class ERC8004Registry {
    private mode;
    private contractAddress;
    private provider;
    private signer;
    private mockStore;
    constructor(contractAddress?: string, rpcUrl?: string, privateKey?: string);
    /**
     * Registers an agent on chain or in mock store.
     * @param descriptor The agent metadata
     * @returns Transaction Hash
     */
    register(descriptor: AgentDescriptor): Promise<string>;
    /**
     * Finds agents possessing a specific capability.
     * Scans event logs in TESTNET mode or memory in LOCAL mode.
     * @param capability The capability tag to search for
     */
    findAgents(capability: string): Promise<AgentDescriptor[]>;
}
