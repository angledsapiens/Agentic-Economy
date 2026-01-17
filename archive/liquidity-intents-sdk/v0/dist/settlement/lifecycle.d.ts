import { LiquidityIntent } from '../core/intent';
export declare class LifecycleController {
    private activeLocks;
    optimisticLock(intent: LiquidityIntent): boolean;
    monitorTimeout(intent: LiquidityIntent, lockExpiry: number): Promise<void>;
    executeWithBackoff<T>(fn: () => Promise<T>, retries?: number): Promise<T>;
}
