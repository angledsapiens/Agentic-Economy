/**
 * Validates that the connected network is ARC Testnet.
 * HARD FAILS if any other chain is detected.
 */
export declare function validateARCNetwork(rpcUrl: string): Promise<void>;
