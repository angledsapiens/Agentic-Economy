"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleSettlementProvider = void 0;
const uuid_1 = require("uuid");
/**
 * Circle Settlement Provider
 * DEPRECATED for ARC Testnet (Circle does not support ARC).
 * Only functional in LOCAL mode for development/testing.
 */
class CircleSettlementProvider {
    constructor(apiKey, walletId) {
        this.name = 'CIRCLE_USDC_BASE';
        this.mode = process.env.LIS_MODE || 'LOCAL';
        this.apiKey = apiKey || process.env.CIRCLE_API_KEY || '';
        this.walletId = walletId || process.env.CIRCLE_WALLET_ID || '1017365190'; // Default Master
    }
    async getBalance(asset) {
        if (this.mode === 'LOCAL') {
            // Mock Balance (LOCAL mode only)
            return '10000000000'; // 10,000 USDC
        }
        // TESTNET/LIVE: Circle does NOT support ARC Testnet
        throw new Error(`❌ Circle Provider is UNSUPPORTED on ARC Testnet (pending Circle support). ` +
            `Use ARCSettlementProvider instead. Current mode: ${this.mode}`);
    }
    async executeTransfer(to, amount, asset, memo) {
        if (this.mode === 'LOCAL') {
            // Mock transfer (LOCAL mode only)
            const mockTxId = `tx_mock_${(0, uuid_1.v4)()}`;
            console.log(`[CircleProvider] LOCAL MODE: Mock transfer ${amount} ${asset} to ${to}. TX: ${mockTxId}`);
            return {
                transactionId: mockTxId,
                status: 'COMPLETED'
            };
        }
        // TESTNET/LIVE: Circle does NOT support ARC Testnet
        throw new Error(`❌ Circle Provider is UNSUPPORTED on ARC Testnet (pending Circle support). ` +
            `Cannot execute transfer. Use ARCSettlementProvider instead.`);
    }
}
exports.CircleSettlementProvider = CircleSettlementProvider;
