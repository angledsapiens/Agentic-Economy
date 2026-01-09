"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureVerifier = void 0;
const ethers_1 = require("ethers");
const env_1 = require("../config/env");
class SignatureVerifier {
    verifyHandshake(intent, commitment, feedbackAuth = false) {
        const domain = {
            name: 'AgenticEconomy',
            version: '1',
            chainId: env_1.DEFAULT_CHAIN_ID,
            verifyingContract: '0x0000000000000000000000000000000000000000'
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
        const value = {
            ...intent,
            asset: {
                ...intent.asset,
                address: intent.asset.address || '0x0000000000000000000000000000000000000000'
            },
            feedbackAuth
        };
        try {
            const recoveredAddress = (0, ethers_1.verifyTypedData)(domain, types, value, commitment.signature);
            return recoveredAddress.toLowerCase() === intent.seller.toLowerCase();
        }
        catch (error) {
            console.error("Signature verification failed:", error);
            return false;
        }
    }
    verifyDelivery(intent, deliveryProof) {
        // Stub: Verify the final delivery signature
        return true;
    }
}
exports.SignatureVerifier = SignatureVerifier;
