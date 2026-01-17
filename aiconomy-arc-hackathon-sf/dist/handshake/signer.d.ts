import { LiquidityIntent } from '../core/intent';
export declare class HandshakeSigner {
    private wallet;
    constructor(privateKey: string);
    signIntent(intent: LiquidityIntent, feedbackAuth?: boolean): Promise<string>;
    getAddress(): string;
}
