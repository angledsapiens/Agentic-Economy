import { InterpretedIntent } from '../core/interpretation';
import { TreasuryManager } from '../treasury/manager';
import { CircleSettlementProvider } from './circle-provider';

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
    // In a real app, providers would be injected.
    // Here we default to Circle for Sprint 3.
    const provider = new CircleSettlementProvider(config?.apiKey, config?.walletId);
    this.treasury = new TreasuryManager(provider);
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
}
