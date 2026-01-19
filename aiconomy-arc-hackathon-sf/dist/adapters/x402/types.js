"use strict";
/**
 * x402 Micropayment Standards
 * Defines headers and payload structures for autonomous payments.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEADER_AUTHORIZATION = exports.HEADER_L402_PRICE = void 0;
exports.HEADER_L402_PRICE = 'L402-Price'; // e.g. "1000;USDC;did:pkh:..."
exports.HEADER_AUTHORIZATION = 'Authorization'; // e.g. "x402-proof <tx_hash>"
