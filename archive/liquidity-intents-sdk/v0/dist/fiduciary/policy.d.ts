import { LiquidityIntent } from '../core/intent';
export declare class FiduciaryGuardian {
    private config;
    constructor(customPolicy?: any);
    validateIntent(intent: LiquidityIntent): boolean;
}
