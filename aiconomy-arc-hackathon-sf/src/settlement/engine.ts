import { InterpretedIntent } from '../core/interpretation';
import { TreasuryManager } from '../treasury/manager';
import { CircleSettlementProvider } from './circle-provider';
import { ARCSettlementProvider } from './arc-provider';

/**
 * Settlement Engine (Facade)
 * Coordinates the Treasury Layer for high-level settlement operations.
 *
 * Flow:
 * 1. Reserve Funds (Optimistic Lock)
 * 2. Execute Settlement (Authorized Transfer)
 */
export class SettlementEngine {
  private treasury: TreasuryManager;

  constructor(config?: any) {
    const mode = process.env.LIS_MODE || 'LOCAL';

    let provider;

    if (mode === 'TESTNET') {
      // ARC Testnet: Use ARC-native provider
      console.log('[SettlementEngine] Mode: TESTNET → Using ARCSettlementProvider');
      provider = new ARCSettlementProvider(config?.rpcUrl, config?.privateKey);
    } else if (mode === 'LOCAL') {
      // LOCAL: Use Circle (mocked)
      console.log('[SettlementEngine] Mode: LOCAL → Using CircleSettlementProvider (mocked)');
      provider = new CircleSettlementProvider(config?.apiKey, config?.walletId);
    } else {
      // LIVE: Would use Circle on supported mainnet
      console.log('[SettlementEngine] Mode: LIVE → Using CircleSettlementProvider');
      provider = new CircleSettlementProvider(config?.apiKey, config?.walletId);
    }

    this.treasury = new TreasuryManager(provider, mode);
  }

  /**
   * Reserves funds for the intention.
   * Throws if insufficient funds.
   * @returns reservationId
   */
  async reserve(intent: InterpretedIntent): Promise<string> {
    console.log(`[Settlement] Reserving funds for intent type ${intent.type}...`);
    const reservation = await this.treasury.reserveFunds(intent);
    return reservation.id;
  }

  /**
   * Executes the final settlement.
   * @param reservationId The ID returned from reserve()
   * @param destination The confirmed destination address/DID
   */
  async settle(reservationId: string, destination: string): Promise<string> {
    console.log(`[Settlement] Executing settlement for reservation ${reservationId}...`);
    return await this.treasury.settle(reservationId, destination);
  }

  /**
   * Releases a reservation (e.g. if negotiation failed).
   */
  async release(reservationId: string): Promise<void> {
    console.log(`[Settlement] Releasing reservation ${reservationId}...`);
    this.treasury.releaseReservation(reservationId);
  }

  /**
   * Gets current balance snapshot for an asset.
   */
  async getBalance(asset: string) {
    return await this.treasury.getSnapshot(asset);
  }

  /**
   * Verifies an x402 payment proof if the provider supports it.
   */
  async verifyPaymentProof(txHash: string, requiredAmount: string, expectedRecipient: string): Promise<boolean> {
    // Access provider via internal property (unsafe cast for facade pattern)
    // In a real TS project we would expose provider or add verifyPaymentProof to ITreasury/Provider interface
    // For this hackathon scope we cast.
    const provider = (this.treasury as any)['provider'];

    if (provider instanceof ARCSettlementProvider) {
      return provider.verifyPaymentProof(
        txHash,
        BigInt(requiredAmount),
        expectedRecipient
      );
    }

    // For other providers (e.g. Circle mock in LOCAL mode), we might verify differently or allow mock
    if (process.env.LIS_MODE !== 'TESTNET') {
      console.log('[Settlement] LOCAL/DEV mode: Skipping strict on-chain verification');
      return true;
    }

    return false;
  }
}
