/**
 * Settlement Provider Abstraction
 * Decouples the generic "intent" to move money from the specific payment rail (Circle, Chain, etc.).
 */
export interface SettlementTransferResult {
    transactionId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    fee?: string;
}
export interface SettlementProvider {
    /**
     * The name of the provider (e.g. "CIRCLE_USDC_BASE")
     */
    readonly name: string;
    /**
     * Returns the total confirmed balance for the given asset.
     * @param asset Asset symbol (e.g. "USDC")
     */
    getBalance(asset: string): Promise<string>;
    /**
     * Executes an atomic transfer of funds.
     * Logic constraints (policy, reservations) are enforced by the caller (Treasury).
     * @param to Destination ID (Address or DID)
     * @param amount Amount in wei
     * @param asset Asset symbol
     * @param memo Optional reference/intent ID
     */
    executeTransfer(to: string, amount: string, asset: string, memo?: string): Promise<SettlementTransferResult>;
    /**
     * Optional: Estimates gas cost for a transfer (for chains where gas is paid in the same asset).
     * Returns estimated gas cost in asset's base units.
     */
    estimateGas?(to: string, amount: string, asset: string): Promise<string>;
}
