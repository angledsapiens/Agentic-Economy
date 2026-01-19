import { SettlementProvider, SettlementTransferResult } from './provider';
/**
 * ARC Settlement Provider
 * Implements direct ERC-20 USDC transfers on ARC Testnet via ethers.js.
 * NO MOCKS. Returns real on-chain transaction hashes only.
 */
export declare class ARCSettlementProvider implements SettlementProvider {
    readonly name = "ARC_USDC_NATIVE";
    private provider;
    private wallet;
    private usdcContract;
    private readonly USDC_ADDRESS;
    private readonly ERC20_ABI;
    constructor(rpcUrl?: string, privateKey?: string);
    getBalance(asset: string): Promise<string>;
    executeTransfer(to: string, amount: string, asset: string, memo?: string): Promise<SettlementTransferResult>;
    /**
     * Estimates gas cost for a USDC transfer on ARC Testnet.
     * Returns gas cost in USDC wei (since USDC is native gas token on ARC).
     */
    estimateGas(to: string, amount: string, asset: string): Promise<string>;
}
