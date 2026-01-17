import { LiquidityIntent } from '../core/intent';
export declare class SettlementEngine {
    private fiduciary;
    private lifecycle;
    constructor(config?: any);
    preFlightReputationCheck(providerDID: string): Promise<boolean>;
    lockFunds(intent: LiquidityIntent): Promise<boolean>;
    private mockCircleApiCall;
    releaseFunds(intent: LiquidityIntent, proof: string): Promise<boolean>;
}
