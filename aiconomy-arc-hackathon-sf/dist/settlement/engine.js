"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementEngine = void 0;
const manager_1 = require("../treasury/manager");
const circle_provider_1 = require("./circle-provider");
const arc_provider_1 = require("./arc-provider");
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
        const mode = process.env.LIS_MODE || 'LOCAL';
        let provider;
        if (mode === 'TESTNET') {
            // ARC Testnet: Use ARC-native provider
            console.log('[SettlementEngine] Mode: TESTNET → Using ARCSettlementProvider');
            provider = new arc_provider_1.ARCSettlementProvider(config?.rpcUrl, config?.privateKey);
        }
        else if (mode === 'LOCAL') {
            // LOCAL: Use Circle (mocked)
            console.log('[SettlementEngine] Mode: LOCAL → Using CircleSettlementProvider (mocked)');
            provider = new circle_provider_1.CircleSettlementProvider(config?.apiKey, config?.walletId);
        }
        else {
            // LIVE: Would use Circle on supported mainnet
            console.log('[SettlementEngine] Mode: LIVE → Using CircleSettlementProvider');
            provider = new circle_provider_1.CircleSettlementProvider(config?.apiKey, config?.walletId);
        }
        this.treasury = new manager_1.TreasuryManager(provider, mode);
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
