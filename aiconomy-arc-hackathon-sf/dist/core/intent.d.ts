import { AssetProfile } from './assets';
import { EnvelopeType } from './constants';
export interface LiquidityIntent {
    id: string;
    buyer: string;
    seller: string;
    asset: AssetProfile;
    amount: string;
    envelopeType: EnvelopeType;
    deadline: number;
    metadata?: Record<string, any>;
}
export interface IntentCommitment {
    intentId: string;
    signature: string;
}
