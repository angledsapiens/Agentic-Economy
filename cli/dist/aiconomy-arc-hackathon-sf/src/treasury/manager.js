"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreasuryManager = void 0;
const treasury_1 = require("../core/treasury");
const uuid_1 = require("uuid");
/**
 * Treasury Manager
 * Manages the availability of funds, reservations, and settlement execution.
 * Enforces correct accounting before calling the provider.
 */
class TreasuryManager {
    constructor(provider) {
        this.reservations = new Map();
        // In-memory mock for "Available Balance" tracking relative to provider query
        // In v2 this needs to be persistent state
        this.lastKnownBalance = 0n;
        this.provider = provider;
    }
    /**
     * Refreshes balance from provider and returns a snapshot including local reservations.
     */
    async getSnapshot(asset) {
        const balanceStr = await this.provider.getBalance(asset);
        this.lastKnownBalance = BigInt(balanceStr);
        let reservedTotal = 0n;
        for (const r of this.reservations.values()) {
            if (r.asset === asset && r.status === treasury_1.ReservationStatus.ACTIVE) {
                reservedTotal += BigInt(r.amount);
            }
        }
        const available = this.lastKnownBalance - reservedTotal;
        return {
            currency: asset,
            totalBalance: balanceStr,
            reservedBalance: reservedTotal.toString(),
            availableBalance: available < 0n ? '0' : available.toString(),
            lastUpdated: Date.now()
        };
    }
    /**
     * Attempts to reserve funds for a specific intent.
     * Throws if insufficient funds.
     */
    async reserveFunds(intent) {
        const asset = intent.settlement.asset;
        const amount = BigInt(intent.settlement.amount);
        // 1. Check Availability
        const snapshot = await this.getSnapshot(asset);
        const available = BigInt(snapshot.availableBalance);
        if (amount > available) {
            throw new Error(`Insufficient funds. Required: ${amount}, Available: ${available}`);
        }
        // 2. Create Reservation
        const reservation = {
            id: `res_${(0, uuid_1.v4)()}`,
            intentId: 'intent_ref_pending', // In a real flow, we'd pass the ID
            asset: asset,
            amount: intent.settlement.amount,
            status: treasury_1.ReservationStatus.ACTIVE,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 hour hold
        };
        this.reservations.set(reservation.id, reservation);
        console.log(`[Treasury] Funds Reserved: ${reservation.id} for ${amount} ${asset}`);
        return reservation;
    }
    /**
     * Releases a reservation without spending (rollback).
     */
    releaseReservation(reservationId) {
        const res = this.reservations.get(reservationId);
        if (res && res.status === treasury_1.ReservationStatus.ACTIVE) {
            res.status = treasury_1.ReservationStatus.RELEASED;
            console.log(`[Treasury] Reservation Released: ${reservationId}`);
        }
    }
    /**
     * Executes settlement for a reservation.
     * Consumes the reservation and calls the provider.
     */
    async settle(reservationId, destination) {
        const res = this.reservations.get(reservationId);
        if (!res || res.status !== treasury_1.ReservationStatus.ACTIVE) {
            throw new Error(`Invalid or inactive reservation: ${reservationId}`);
        }
        // 1. Execute Transfer
        const result = await this.provider.executeTransfer(destination, res.amount, res.asset, `Settlement for intent ${res.intentId}`);
        if (result.status === 'FAILED') {
            throw new Error(`Settlement Transfer Failed`);
        }
        // 2. Mark Settled
        res.status = treasury_1.ReservationStatus.SETTLED;
        console.log(`[Treasury] Settlement Initiated: ${result.transactionId}`);
        return result.transactionId;
    }
}
exports.TreasuryManager = TreasuryManager;
