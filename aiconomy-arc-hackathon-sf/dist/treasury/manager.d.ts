import { InterpretedIntent } from '../core/interpretation';
import { TreasurySnapshot, Reservation } from '../core/treasury';
import { SettlementProvider } from '../settlement/provider';
/**
 * Treasury Manager
 * Manages the availability of funds, reservations, and settlement execution.
 * Enforces correct accounting before calling the provider.
 */
export declare class TreasuryManager {
    private provider;
    private reservations;
    private lastKnownBalance;
    constructor(provider: SettlementProvider, mode?: string);
    /**
     * Initializes treasury from on-chain balance (TESTNET mode only).
     * Fails fast if chain unavailable.
     */
    private initializeFromChain;
    /**
     * Refreshes balance from provider and returns a snapshot including local reservations.
     */
    getSnapshot(asset: string): Promise<TreasurySnapshot>;
    /**
     * Attempts to reserve funds for a specific intent.
     * Throws if insufficient funds.
     */
    reserveFunds(intent: InterpretedIntent): Promise<Reservation>;
    /**
     * Releases a reservation without spending (rollback).
     */
    releaseReservation(reservationId: string): void;
    /**
     * Executes settlement for a reservation.
     * Consumes the reservation and calls the provider.
     */
    settle(reservationId: string, destination: string): Promise<string>;
}
