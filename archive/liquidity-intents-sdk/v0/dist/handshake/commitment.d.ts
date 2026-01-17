import { LiquidityIntent, IntentCommitment } from '../core/intent';
import { HandshakeSigner } from './signer';
export declare class HandshakeManager {
    private signer;
    constructor(signer: HandshakeSigner);
    createCommitment(intent: LiquidityIntent): Promise<IntentCommitment>;
}
