"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymasterService = void 0;
const ethers_1 = require("ethers");
class PaymasterService {
    constructor(paymasterUrl = 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/sdksample') {
        this.paymasterUrl = paymasterUrl;
    }
    async shouldSponsor(address, provider) {
        const balance = await provider.getBalance(address);
        // Sponsor if balance is < 0.001 ETH
        const threshold = ethers_1.ethers.parseEther("0.001");
        return balance < threshold;
    }
    async getPaymasterAndData(userOp) {
        console.log(`[Paymaster] Requesting sponsorship for UserOp via ${this.paymasterUrl}...`);
        // In a real 4337 flow, we would hit the JSON-RPC 'pm_sponsorUserOperation'
        // For v0 EOA, we might just log or generic mock.
        // Return dummy paymasterAndData
        return "0x";
    }
    // Stub for "Gasless" transaction wrapping
    async wrapTransaction(tx) {
        console.log("[Paymaster] Wrapping transaction for sponsorship...");
        // Convert EOA tx to UserOperation-like structure (conceptual for v0)
        return {
            sender: tx.from,
            nonce: "0x0",
            initCode: "0x",
            callData: tx.data,
            paymasterAndData: "0xMagicPaymasterSignature"
        };
    }
}
exports.PaymasterService = PaymasterService;
