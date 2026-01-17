"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeManager = void 0;
class HandshakeManager {
    constructor(signer) {
        this.signer = signer;
    }
    async createCommitment(intent) {
        const signature = await this.signer.signIntent(intent);
        return {
            intentId: intent.id,
            signature
        };
    }
}
exports.HandshakeManager = HandshakeManager;
