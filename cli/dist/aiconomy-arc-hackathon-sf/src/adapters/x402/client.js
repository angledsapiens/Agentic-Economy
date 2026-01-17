"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402Client = void 0;
const types_1 = require("./types");
const interpreter_1 = require("../../interpretation/interpreter");
const guardian_1 = require("../../fiduciary/guardian");
/**
 * X402 Client
 *
 * An autonomous HTTP client that handles 402 Payment Required responses.
 * It integrates the full LIS stack: Interpret -> Fiduciary -> Treasury -> Settle.
 */
class X402Client {
    constructor(profile, policy, engine, fetcher) {
        this.profile = profile;
        this.policy = policy;
        this.engine = engine;
        this.guardian = new guardian_1.FiduciaryGuardian();
        this.fetcher = fetcher || this.defaultFetch.bind(this);
    }
    /**
     * Performs an HTTP request.
     * If it encounters a 402, it attempts to pay and retry (once).
     */
    async fetch(url, options = {}) {
        console.log(`[X402Client] Requesting ${url}...`);
        // 1. Initial Request
        let response = await this.fetcher(url, options);
        // 2. Handle 402
        if (response.status === 402) {
            console.log(`[X402Client] Received 402 Payment Required`);
            const priceHeader = response.headers[types_1.HEADER_L402_PRICE];
            if (!priceHeader)
                throw new Error('Missing L402-Price header');
            // 3. Parse Challenge
            const challenge = this.parsePriceHeader(priceHeader);
            // 4. Create Intent Template
            const template = {
                templateType: 'BUY_SERVICE',
                serviceName: `HTTP Resource: ${url}`,
                description: 'Autonomous x402 Payment',
                sellerDID: challenge.recipient,
                maxPrice: challenge.amount
            };
            // 5. Interpret Intent
            const intent = (0, interpreter_1.interpret)(template);
            // 6. Fiduciary Check
            const validation = this.guardian.validate(intent, this.profile, this.policy, '0');
            if (!validation.allowed) {
                throw new Error(`Fiduciary denied payment: ${validation.reason}`);
            }
            // 7. Settle
            const reservationId = await this.engine.reserve(intent);
            const txId = await this.engine.settle(reservationId, challenge.recipient);
            // 8. Retry with Proof
            console.log(`[X402Client] Retrying with Proof (TxHash): ${txId}`);
            const newOptions = { ...options };
            newOptions.headers = {
                ...newOptions.headers,
                [types_1.HEADER_AUTHORIZATION]: `x402-proof ${txId}`
            };
            response = await this.fetcher(url, newOptions);
        }
        return response;
    }
    parsePriceHeader(header) {
        // Format: "amount;asset;recipient"
        const parts = header.split(';');
        if (parts.length < 3)
            throw new Error('Invalid Price Header Format');
        return {
            amount: parts[0],
            asset: parts[1],
            recipient: parts[2]
        };
    }
    // Default Fetch to simulate server without spinning up real HTTP listener for Client unit logic
    async defaultFetch(url, options) {
        return { status: 404, headers: {} };
    }
}
exports.X402Client = X402Client;
