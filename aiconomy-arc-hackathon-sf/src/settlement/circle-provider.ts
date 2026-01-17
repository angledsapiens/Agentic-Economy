import { SettlementProvider, SettlementTransferResult } from './provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * Circle Settlement Provider
 * Implements the SettlementProvider interface for Circle's Programmable Wallets.
 */
export class CircleSettlementProvider implements SettlementProvider {
  readonly name = 'CIRCLE_USDC_BASE';
  private apiKey: string;
  private walletId: string;
  private mode: 'LOCAL' | 'TESTNET' | 'LIVE';

  constructor(apiKey?: string, walletId?: string) {
    this.mode = (process.env.LIS_MODE as any) || 'LOCAL';
    this.apiKey = apiKey || process.env.CIRCLE_API_KEY || '';
    this.walletId = walletId || process.env.CIRCLE_WALLET_ID || '1017365190'; // Default Master
  }

  async getBalance(asset: string): Promise<string> {
    if (this.mode === 'LOCAL') {
      // Mock Balance
      return '10000000000'; // 10,000 USDC
    }

    // Stub for live API call
    console.log(`[CircleProvider] Fetching balance for ${asset} (stubbed)`);
    return '5000000000';
  }

  async executeTransfer(to: string, amount: string, asset: string, memo?: string): Promise<SettlementTransferResult> {
    console.log(`[CircleProvider] Executing transfer of ${amount} ${asset} to ${to}. Memo: ${memo}`);

    if (this.mode === 'LOCAL') {
      return {
        transactionId: `tx_mock_${uuidv4()}`,
        status: 'COMPLETED'
      };
    }

    // LIVE / TESTNET Logic
    const baseUrl = this.mode === 'TESTNET' ?
      (process.env.CIRCLE_API_URL_SANDBOX || 'https://api-sandbox.circle.com/v1') :
      (process.env.CIRCLE_API_URL_PROD || 'https://api.circle.com/v1');

    try {
      const response = await fetch(`${baseUrl}/transfers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idempotencyKey: uuidv4(),
          source: { type: 'wallet', id: this.walletId },
          destination: {
            type: 'blockchain',
            address: to,
            chain: 'ETH'
          },
          amount: { amount: this.weiToUnit(amount), currency: 'USD' }
        })
      });

      const data = await response.json();

      if (response.status !== 200 && response.status !== 201) {
        console.error(`[CircleProvider] API Error:`, data);
        return { transactionId: '', status: 'FAILED' };
      }

      return {
        transactionId: data.data?.id,
        status: 'PENDING' // Circle transfers are async
      };

    } catch (e) {
      console.error(`[CircleProvider] Network Error:`, e);
      return { transactionId: '', status: 'FAILED' };
    }
  }

  private weiToUnit(wei: string): string {
    // Simplified Mock conversion for USDC (6 decimals)
    // Production should use proper BigNumber math
    const val = BigInt(wei);
    const unit = Number(val) / 1000000;
    return unit.toFixed(2);
  }
}
