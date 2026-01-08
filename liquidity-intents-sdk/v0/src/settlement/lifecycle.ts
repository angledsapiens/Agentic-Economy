import { LiquidityIntent } from '../core/intent';

export class LifecycleController {
  private activeLocks: Map<string, number> = new Map(); // intentId -> timestamp

  // 1. Optimistic Locking
  optimisticLock(intent: LiquidityIntent): boolean {
    if (this.activeLocks.has(intent.id)) return false;

    const amount = BigInt(intent.amount);
    if (amount < 1000000n) { // Low value (< $1.00)
      console.log(`[Lifecycle] Optimistic lock granted for low-value intent ${intent.id}`);
      this.activeLocks.set(intent.id, Date.now());
      return true;
    }
    return false;
  }

  // 2. Timeout Monitor
  async monitorTimeout(intent: LiquidityIntent, lockExpiry: number): Promise<void> {
    const now = Date.now();
    if (now > lockExpiry) {
      console.warn(`[Lifecycle] Intent ${intent.id} expired! Triggering refund logic...`);
      this.activeLocks.delete(intent.id);
      throw new Error("Intent Expired");
    }
  }

  // 3. Resiliency (Exponential Backoff)
  async executeWithBackoff<T>(fn: () => Promise<T>, retries: number = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = Math.pow(2, i) * 1000;
        console.log(`[Lifecycle] Operation failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries exceeded");
  }
}
