import { SettlementProvider, SettlementTransferResult } from './provider';
/**
 * Circle Settlement Provider
 * DEPRECATED for ARC Testnet (Circle does not support ARC).
 * Only functional in LOCAL mode for development/testing.
 */
export declare class CircleSettlementProvider implements SettlementProvider {
    readonly name = "CIRCLE_USDC_BASE";
    private apiKey;
    private walletId;
    private mode;
    constructor(apiKey?: string, walletId?: string);
    getBalance(asset: string): Promise<string>;
    executeTransfer(to: string, amount: string, asset: string, memo?: string): Promise<SettlementTransferResult>;
}
