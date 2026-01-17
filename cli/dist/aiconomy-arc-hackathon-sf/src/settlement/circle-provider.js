"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleSettlementProvider = void 0;
const uuid_1 = require("uuid");
/**
 * Circle Settlement Provider
 * Implements the SettlementProvider interface for Circle's Programmable Wallets.
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
            // Mock Balance
            return '10000000000'; // 10,000 USDC
        }
        // Stub for live API call
        console.log(`[CircleProvider] Fetching balance for ${asset} (stubbed)`);
        return '5000000000';
    }
    async executeTransfer(to, amount, asset, memo) {
        console.log(`[CircleProvider] Executing transfer of ${amount} ${asset} to ${to}. Memo: ${memo}`);
        if (this.mode === 'LOCAL') {
            return {
                transactionId: `tx_mock_${(0, uuid_1.v4)()}`,
                status: 'COMPLETED'
            };
        }
        // LIVE / TESTNET Logic
        const baseUrl = this.mode === 'TESTNET' ?
            (process.env.CIRCLE_API_URL_SANDBOX || 'https://api-sandbox.circle.com/v1') :
            (process.env.CIRCLE_API_URL_PROD || 'https://api.circle.com/v1');
        try {
            const response = await fetch(`${baseUrl}/transfers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idempotencyKey: (0, uuid_1.v4)(),
                    source: { type: 'wallet', id: this.walletId },
                    destination: {
                        type: 'blockchain',
                        address: to,
                        chain: 'ETH'
                    },
                    amount: { amount: this.weiToUnit(amount), currency: 'USD' }
                })
            });
            const data = await response.json();
            if (response.status !== 200 && response.status !== 201) {
                console.error(`[CircleProvider] API Error:`, data);
                return { transactionId: '', status: 'FAILED' };
            }
            return {
                transactionId: data.data?.id,
                status: 'PENDING' // Circle transfers are async
            };
        }
        catch (e) {
            console.error(`[CircleProvider] Network Error:`, e);
            return { transactionId: '', status: 'FAILED' };
        }
    }
    weiToUnit(wei) {
        // Simplified Mock conversion for USDC (6 decimals)
        // Production should use proper BigNumber math
        const val = BigInt(wei);
        const unit = Number(val) / 1000000;
        return unit.toFixed(2);
    }
}
exports.CircleSettlementProvider = CircleSettlementProvider;
