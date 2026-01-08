import { LiquidityIntent } from '../core/intent';
import { FiduciaryGuardian } from '../fiduciary/policy';
import { LifecycleController } from './lifecycle';
import { v4 as uuidv4 } from 'uuid';

interface CircleCreateTransactionResponse {
  id: string;
  state: 'INITIATED' | 'PENDING_RISK_REVIEW' | 'DENIED' | 'COMPLETE';
  challengeId?: string;
}

export class SettlementEngine {
  private fiduciary: FiduciaryGuardian;
  private lifecycle: LifecycleController;

  constructor() {
    this.fiduciary = new FiduciaryGuardian();
    this.lifecycle = new LifecycleController();
  }

  async preFlightReputationCheck(providerDID: string): Promise<boolean> {
    console.log(`[Reputation] Checking reputation for provider ${providerDID}`);
    // Stub: Check against a mock blocklist or always return true
    return true;
  }

  async lockFunds(intent: LiquidityIntent): Promise<boolean> {
    // 0. Fiduciary Check
    if (!this.fiduciary.validateIntent(intent)) {
      return false;
    }

    // 1. Optimistic Lock (if acceptable)
    this.lifecycle.optimisticLock(intent);

    console.log(`[Circle] Initiating transfer for intent ${intent.id} asset ${intent.asset.symbol}`);

    // 2. Execute with Backoff
    try {
      const response = await this.lifecycle.executeWithBackoff(() => this.mockCircleApiCall(intent));

      if (response.challengeId) {
        console.log(`[Circle] Challenge received: ${response.challengeId}. Handling challenge...`);
        // Stub: Logic to sign/solve the challenge would go here
      }

      console.log(`[Circle] Transaction ${response.id} state: ${response.state}`);
      return response.state === 'INITIATED' || response.state === 'COMPLETE';
    } catch (error) {
      console.error(`[Circle] Transaction failed:`, error);
      return false;
    }
  }


  private async mockCircleApiCall(intent: LiquidityIntent): Promise<CircleCreateTransactionResponse> {
    const mode = process.env.LIS_MODE as 'LOCAL' | 'TESTNET' | 'LIVE' || 'LOCAL';

    if (mode === 'TESTNET' || mode === 'LIVE') {
      let apiKey = process.env.CIRCLE_API_KEY?.trim() || '';
      if (!apiKey) throw new Error(`CIRCLE_API_KEY missing for ${mode} mode`);

      // Auto-fix: Ensure prefix exists if missing (Support TEST_API_KEY and SAND_API_KEY)
      if (mode === 'TESTNET' && !apiKey.includes(':')) {
        console.log('[Circle] WARN: Prepending missing SAND_API_KEY: prefix');
        apiKey = `SAND_API_KEY:${apiKey}`;
      }

      const baseUrl = mode === 'TESTNET' ?
        (process.env.CIRCLE_API_URL_SANDBOX || 'https://api-sandbox.circle.com/v1') :
        (process.env.CIRCLE_API_URL_PROD || 'https://api.circle.com/v1');

      console.log(`[Circle] ${mode} MODE: Sending transaction to ${baseUrl}...`);

      try {
        const response = await fetch(`${baseUrl}/transfers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idempotencyKey: uuidv4(),
            source: { type: 'wallet', id: '1017365190' }, // Discovered Master Wallet
            destination: {
              type: 'blockchain',
              address: intent.seller,
              chain: 'ETH' // Sandbox defaults to Sepolia for ETH
            },
            amount: { amount: '1.00', currency: 'USD' }
          })
        });
        const data = await response.json();

        // Log non-success responses for debugging
        if (response.status !== 200 && response.status !== 201) {
          console.warn(`[Circle] API Error (${response.status}):`, JSON.stringify(data, null, 2));
        }

        const status = data.data?.status;
        let internalState: 'INITIATED' | 'PENDING_RISK_REVIEW' | 'DENIED' | 'COMPLETE' = 'DENIED';

        if (status === 'pending' || status === 'complete') {
          internalState = 'INITIATED'; // Pending in Circle = Initiated in SDK
        } else if (status === 'failed') {
          internalState = 'DENIED';
        }

        return {
          id: data.data?.id || `err_${Date.now()}`,
          state: internalState
        };
      } catch (e) {
        console.error("[Circle] API Call Failed", e);
        throw e;
      }
    }

    // LOCAL / Benchmark Mock Mode
    console.log('[Circle] LOCAL MODE: Simulating transaction delay...');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: `tx_${intent.id}_${Date.now()}`,
      state: 'INITIATED',
      challengeId: 'challenge_mock_uuid' // Simulate challenge flow
    };
  }

  async releaseFunds(intent: LiquidityIntent, proof: string): Promise<boolean> {
    // Stub: Verify proof and release funds
    console.log(`Releasing funds for intent ${intent.id} with proof ${proof}`);
    return true;
  }
}
