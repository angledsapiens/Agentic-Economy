import { LiquidityIntent } from '../core/intent';
export declare class Attestor {
    private eas;
    private signer;
    constructor(privateKey?: string);
    pushOutcomeAttestation(intent: LiquidityIntent, status: 'SUCCESS' | 'FAILURE'): Promise<string>;
}
