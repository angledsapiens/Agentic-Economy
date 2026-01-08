import { LiquidityIntent, IntentCommitment } from '../core/intent';
import { HandshakeSigner } from './signer';

export class HandshakeManager {
  constructor(private signer: HandshakeSigner) { }

  async createCommitment(intent: LiquidityIntent): Promise<IntentCommitment> {
    const signature = await this.signer.signIntent(intent);
    return {
      intentId: intent.id,
      signature
    };
  }
}
