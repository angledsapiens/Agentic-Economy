import { FiduciaryGuardian } from '../src/fiduciary/policy';
import { LifecycleController } from '../src/settlement/lifecycle';
import { LiquidityIntent } from '../src/core/intent';
import { USDC_ASSET } from '../src/core/assets';
import { LIP_TEXT } from '../src/core/constants';

describe('Lifecycle Control Layer', () => {
  const fiduciary = new FiduciaryGuardian();
  const lifecycle = new LifecycleController();

  const baseIntent: LiquidityIntent = {
    id: "test-lifecycle-1",
    buyer: "0xBuyer",
    seller: "0xSeller",
    asset: USDC_ASSET,
    amount: "100", // valid
    envelopeType: LIP_TEXT,
    deadline: Date.now() + 10000
  };

  it('FiduciaryGuardian should allow valid amounts', () => {
    expect(fiduciary.validateIntent(baseIntent)).toBe(true);
  });

  it('FiduciaryGuardian should reject amounts exceeding Hard Cap ($5.00)', () => {
    const hugeIntent = { ...baseIntent, amount: "5000001" }; // > 5 USDC
    expect(fiduciary.validateIntent(hugeIntent)).toBe(false);
  });

  it('LifecycleController should grant optimistic locks for low values', () => {
    expect(lifecycle.optimisticLock(baseIntent)).toBe(true);
    // Should fail if already locked
    expect(lifecycle.optimisticLock(baseIntent)).toBe(false);
  });

  it('LifecycleController should throw Error on timeout', async () => {
    const expiredIntent = { ...baseIntent, id: 'timeout-test' };
    const pastTime = Date.now() - 1000;
    await expect(lifecycle.monitorTimeout(expiredIntent, pastTime))
      .rejects
      .toThrow("Intent Expired");
  });

  it('LifecycleController should retryWithBackoff', async () => {
    let tries = 0;
    const failingFn = async () => {
      tries++;
      if (tries < 2) throw new Error("Fail");
      return "Success";
    };

    const result = await lifecycle.executeWithBackoff(failingFn);
    expect(result).toBe("Success");
    expect(tries).toBe(2);
  });
});
