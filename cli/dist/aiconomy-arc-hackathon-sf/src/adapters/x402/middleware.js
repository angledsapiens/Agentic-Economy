"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402Server = void 0;
const types_1 = require("./types");
/**
 * X402 Server Middleware
 *
 * Simulates a server-side interceptor that:
 * 1. Checks for Payment Proof (x402-proof).
 * 2. Validates Proof (via Settlement Provider check - Stubbed here).
 * 3. Allows access OR returns 402 Payment Required.
 */
class X402Server {
    constructor(sellerDID) {
        this.priceMap = new Map();
        this.sellerDID = sellerDID;
    }
    /**
     * Register a price for a resource path.
     */
    setPrice(path, priceInWei) {
        this.priceMap.set(path, priceInWei);
    }
    /**
     * Handles an incoming request.
     * Returns a simulated "Response" object (status, headers, body).
     */
    async handleRequest(path, headers) {
        const price = this.priceMap.get(path);
        // 1. Free Resource
        if (!price) {
            return { status: 200, body: `Success: Free access to ${path}` };
        }
        // 2. Check for Proof
        const authHeader = headers[types_1.HEADER_AUTHORIZATION];
        if (authHeader && authHeader.startsWith('x402-proof ')) {
            const txId = authHeader.split(' ')[1];
            console.log(`[X402Server] Validating on-chain proof (TxHash): ${txId}...`);
            // STUB: Verify txId against chain/settlement provider
            // For Sprint 5 we assume any non-empty proof is valid if it exists
            if (txId) {
                return { status: 200, body: `Success: Paid access to ${path}. Proof accepted.` };
            }
        }
        // 3. Issue 402 Challenge
        return {
            status: 402,
            headers: {
                [types_1.HEADER_L402_PRICE]: `${price};USDC;${this.sellerDID}`,
                'WWW-Authenticate': 'x402-proof'
            },
            body: 'Payment Required'
        };
    }
}
exports.X402Server = X402Server;
