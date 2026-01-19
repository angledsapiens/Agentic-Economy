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
    constructor(provider, mode) {
        this.reservations = new Map();
        // In-memory mock for "Available Balance" tracking relative to provider query
        // In v2 this needs to be persistent state
        this.lastKnownBalance = 0n;
        this.provider = provider;
        const lisMode = mode || process.env.LIS_MODE || 'LOCAL';
        if (lisMode === 'TESTNET') {
            // Initialize from on-chain balance immediately (fail-fast)
            this.initializeFromChain().catch((error) => {
                console.error('[Treasury] FATAL: Failed to initialize from ARC Testnet');
                console.error(`[Treasury] Error: ${error.message}`);
                console.error('[Treasury] Cannot proceed without live balance data');
                process.exit(1);
            });
        }
        else {
            // LOCAL mode: retain demo behavior (lazy initialization)
            console.log('[Treasury] Running in LOCAL mode - using synthetic balance');
        }
    }
    /**
     * Initializes treasury from on-chain balance (TESTNET mode only).
     * Fails fast if chain unavailable.
     */
    async initializeFromChain() {
        console.log('[Treasury] Initializing from on-chain USDC balance...');
        try {
            const balanceStr = await this.provider.getBalance('USDC');
            this.lastKnownBalance = BigInt(balanceStr);
            const balanceUsdc = (Number(balanceStr) / 1000000).toFixed(6);
            console.log(`[Treasury] ✅ Initialized with ${balanceStr} wei USDC from ARC Testnet`);
            console.log(`[Treasury] Wallet balance: ${balanceUsdc} USDC`);
        }
        catch (error) {
            throw new Error(`On-chain balance fetch failed: ${error.message}`);
        }
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
        // Check if provider supports gas estimation (ARC does)
        let gasEstimate = 0n;
        if (this.provider.estimateGas) {
            try {
                const gasStr = await this.provider.estimateGas(intent.counterparty || '0x0000000000000000000000000000000000000000', intent.settlement.amount, asset);
                gasEstimate = BigInt(gasStr);
                console.log(`[Treasury] Gas estimate for reservation: ${gasEstimate.toString()} wei`);
            }
            catch (error) {
                console.warn(`[Treasury] Could not estimate gas: ${error.message}`);
            }
        }
        // Total required = transfer amount + gas (for chains like ARC where USDC is gas token)
        const totalRequired = amount + gasEstimate;
        if (totalRequired > available) {
            console.log(`[Treasury] Insufficient balance (including gas)`);
            console.log(`[Treasury]   Transfer: ${amount} wei`);
            console.log(`[Treasury]   Gas: ${gasEstimate} wei`);
            console.log(`[Treasury]   Total Required: ${totalRequired} wei`);
            console.log(`[Treasury]   Available: ${available} wei`);
            throw new Error(`Insufficient funds. Required: ${totalRequired} (${amount} + ${gasEstimate} gas), Available: ${available}`);
        }
        // 2. Create Reservation (with gas estimate for accurate tracking)
        const reservation = {
            id: `res_${(0, uuid_1.v4)()}`,
            intentId: 'intent_ref_pending', // In a real flow, we'd pass the ID
            asset: asset,
            amount: intent.settlement.amount,
            gasEstimate: gasEstimate > 0n ? gasEstimate.toString() : undefined,
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
