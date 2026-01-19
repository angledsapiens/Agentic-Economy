/**
 * Treasury Core Schemas
 * Defines the state of funds availability and reservation.
 */

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED'
}

export interface Reservation {
  id: string;          // Unique ID
  intentId: string;    // Reference to the originating intent
  asset: string;       // e.g. "USDC"
  amount: string;      // Reserved amount in wei
  gasEstimate?: string; // Optional: for chains where gas is paid in same asset (e.g., ARC USDC)
  status: ReservationStatus;
  createdAt: number;
  expiresAt: number;
}

export interface TreasurySnapshot {
  currency: string;
  totalBalance: string;     // Total funds in the wallet
  reservedBalance: string;  // Funds currently locked by active reservations
  availableBalance: string; // total - reserved (The value effectively spendable)
  lastUpdated: number;
}
