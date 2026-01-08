import { LiquidityIntent, IntentCommitment } from '../core/intent';
export declare class SignatureVerifier {
    verifyHandshake(intent: LiquidityIntent, commitment: IntentCommitment, feedbackAuth?: boolean): boolean;
    verifyDelivery(intent: LiquidityIntent, deliveryProof: string): boolean;
}
