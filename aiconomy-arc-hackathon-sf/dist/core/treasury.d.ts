/**
 * Treasury Core Schemas
 * Defines the state of funds availability and reservation.
 */
export declare enum ReservationStatus {
    ACTIVE = "ACTIVE",
    RELEASED = "RELEASED",
    SETTLED = "SETTLED",
    EXPIRED = "EXPIRED"
}
export interface Reservation {
    id: string;
    intentId: string;
    asset: string;
    amount: string;
    gasEstimate?: string;
    status: ReservationStatus;
    createdAt: number;
    expiresAt: number;
}
export interface TreasurySnapshot {
    currency: string;
    totalBalance: string;
    reservedBalance: string;
    availableBalance: string;
    lastUpdated: number;
}
