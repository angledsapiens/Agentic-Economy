"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptGenerator = void 0;
const ethers_1 = require("ethers");
const uuid_1 = require("uuid");
class ReceiptGenerator {
    constructor(privateKey) {
        this.domain = {
            name: 'AgenticEconomyAudit',
            version: '1',
            chainId: 1, // Default, should be configurable
            verifyingContract: '0x0000000000000000000000000000000000000000'
        };
        this.types = {
            AuditReceipt: [
                { name: 'missionId', type: 'string' },
                { name: 'intentHash', type: 'string' },
                { name: 'settlementTx', type: 'string' },
                { name: 'deliveryArtifactHash', type: 'string' },
                { name: 'timestamp', type: 'uint256' }
            ]
        };
        this.signer = new ethers_1.ethers.Wallet(privateKey);
    }
    async generateReceipt(intent, settlementTx, deliveryArtifactHash) {
        const receipt = {
            missionId: (0, uuid_1.v4)(),
            intentHash: ethers_1.ethers.id(JSON.stringify(intent)), // Simplification for v0
            settlementTx: settlementTx,
            deliveryArtifactHash: deliveryArtifactHash,
            timestamp: Date.now()
        };
        const signature = await this.signer.signTypedData(this.domain, this.types, receipt);
        return { receipt, signature };
    }
}
exports.ReceiptGenerator = ReceiptGenerator;
