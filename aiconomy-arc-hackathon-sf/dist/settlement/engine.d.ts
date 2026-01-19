import { InterpretedIntent } from '../core/interpretation';
/**
 * Settlement Engine (Facade)
 * Coordinates the Treasury Layer for high-level settlement operations.
 *
 * Flow:
 * 1. Reserve Funds (Optimistic Lock)
 * 2. Execute Settlement (Authorized Transfer)
 */
export declare class SettlementEngine {
    private treasury;
    constructor(config?: any);
    /**
     * Reserves funds for the intention.
     * Throws if insufficient funds.
     * @returns reservationId
     */
    reserve(intent: InterpretedIntent): Promise<string>;
    /**
     * Executes the final settlement.
     * @param reservationId The ID returned from reserve()
     * @param destination The confirmed destination address/DID
     */
    settle(reservationId: string, destination: string): Promise<string>;
    /**
     * Releases a reservation (e.g. if negotiation failed).
     */
    release(reservationId: string): Promise<void>;
    /**
     * Gets current balance snapshot for an asset.
     */
    getBalance(asset: string): Promise<import("../core/treasury").TreasurySnapshot>;
}
