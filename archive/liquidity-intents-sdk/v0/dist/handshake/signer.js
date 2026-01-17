"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeSigner = void 0;
const ethers_1 = require("ethers");
const env_1 = require("../config/env");
class HandshakeSigner {
    constructor(privateKey) {
        this.wallet = new ethers_1.Wallet(privateKey);
    }
    async signIntent(intent, feedbackAuth = false) {
        const domain = {
            name: 'AgenticEconomy',
            version: '1',
            chainId: env_1.DEFAULT_CHAIN_ID, // TODO: Make dynamic based on intent.asset.chainId
            verifyingContract: env_1.VERIFYING_CONTRACT_ADDRESS
        };
        const types = {
            AssetProfile: [
                { name: 'type', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'address', type: 'address' },
                { name: 'decimals', type: 'uint8' },
                { name: 'symbol', type: 'string' }
            ],
            LiquidityIntent: [
                { name: 'id', type: 'string' },
                { name: 'buyer', type: 'address' },
                { name: 'seller', type: 'address' },
                { name: 'asset', type: 'AssetProfile' },
                { name: 'amount', type: 'uint256' },
                { name: 'envelopeType', type: 'string' },
                { name: 'deadline', type: 'uint256' },
                { name: 'feedbackAuth', type: 'bool' }
            ]
        };
        // Sanitize values for EIP-712
        const value = {
            ...intent,
            asset: {
                ...intent.asset,
                address: intent.asset.address || '0x0000000000000000000000000000000000000000'
            },
            feedbackAuth
        };
        return this.wallet.signTypedData(domain, types, value);
    }
    getAddress() {
        return this.wallet.address;
    }
}
exports.HandshakeSigner = HandshakeSigner;
