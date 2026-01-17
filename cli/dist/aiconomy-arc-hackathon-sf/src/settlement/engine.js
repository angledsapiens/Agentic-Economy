"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementEngine = void 0;
const manager_1 = require("../treasury/manager");
const circle_provider_1 = require("./circle-provider");
/**
 * Settlement Engine (Facade)
 * Coordinates the Treasury Layer for high-level settlement operations.
 *
 * Flow:
 * 1. Reserve Funds (Optimistic Lock)
 * 2. Execute Settlement (Authorized Transfer)
 */
class SettlementEngine {
    constructor(config) {
        // In a real app, providers would be injected.
        // Here we default to Circle for Sprint 3.
        const provider = new circle_provider_1.CircleSettlementProvider(config?.apiKey, config?.walletId);
        this.treasury = new manager_1.TreasuryManager(provider);
    }
    /**
     * Reserves funds for the intention.
     * Throws if insufficient funds.
     * @returns reservationId
     */
    async reserve(intent) {
        console.log(`[Settlement] Reserving funds for intent type ${intent.type}...`);
        const reservation = await this.treasury.reserveFunds(intent);
        return reservation.id;
    }
    /**
     * Executes the final settlement.
     * @param reservationId The ID returned from reserve()
     * @param destination The confirmed destination address/DID
     */
    async settle(reservationId, destination) {
        console.log(`[Settlement] Executing settlement for reservation ${reservationId}...`);
        return await this.treasury.settle(reservationId, destination);
    }
    /**
     * Releases a reservation (e.g. if negotiation failed).
     */
    async release(reservationId) {
        console.log(`[Settlement] Releasing reservation ${reservationId}...`);
        this.treasury.releaseReservation(reservationId);
    }
    /**
     * Gets current balance snapshot for an asset.
     */
    async getBalance(asset) {
        return await this.treasury.getSnapshot(asset);
    }
}
exports.SettlementEngine = SettlementEngine;
