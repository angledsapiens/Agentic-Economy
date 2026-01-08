import { LiquidityIntent } from '../core/intent';
export interface AuditReceipt {
    missionId: string;
    intentHash: string;
    settlementTx: string;
    deliveryArtifactHash: string;
    timestamp: number;
}
export declare class ReceiptGenerator {
    private signer;
    private domain;
    private types;
    constructor(privateKey: string);
    generateReceipt(intent: LiquidityIntent, settlementTx: string, deliveryArtifactHash: string): Promise<{
        receipt: AuditReceipt;
        signature: string;
    }>;
}
