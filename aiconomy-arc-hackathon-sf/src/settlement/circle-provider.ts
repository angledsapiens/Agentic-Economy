import { SettlementProvider, SettlementTransferResult } from './provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * Circle Settlement Provider
 * DEPRECATED for ARC Testnet (Circle does not support ARC).
 * Only functional in LOCAL mode for development/testing.
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
      // Mock Balance (LOCAL mode only)
      return '10000000000'; // 10,000 USDC
    }

    // TESTNET/LIVE: Circle does NOT support ARC Testnet
    throw new Error(
      `❌ Circle Provider is UNSUPPORTED on ARC Testnet (pending Circle support). ` +
      `Use ARCSettlementProvider instead. Current mode: ${this.mode}`
    );
  }

  async executeTransfer(to: string, amount: string, asset: string, memo?: string): Promise<SettlementTransferResult> {
    if (this.mode === 'LOCAL') {
      // Mock transfer (LOCAL mode only)
      const mockTxId = `tx_mock_${uuidv4()}`;
      console.log(`[CircleProvider] LOCAL MODE: Mock transfer ${amount} ${asset} to ${to}. TX: ${mockTxId}`);
      return {
        transactionId: mockTxId,
        status: 'COMPLETED'
      };
    }

    // TESTNET/LIVE: Circle does NOT support ARC Testnet
    throw new Error(
      `❌ Circle Provider is UNSUPPORTED on ARC Testnet (pending Circle support). ` +
      `Cannot execute transfer. Use ARCSettlementProvider instead.`
    );
  }
}
