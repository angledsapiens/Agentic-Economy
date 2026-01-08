import { LiquidityIntent } from '../core/intent';
import { formatUnits } from 'ethers';
// import policy from '../../Policy.json'; // Importing JSON directly requires resolveJsonModule
const policy = require('../../Policy.json');

export class FiduciaryGuardian {
  private config: any;

  constructor(customPolicy?: any) {
    this.config = customPolicy || policy;
  }

  validateIntent(intent: LiquidityIntent): boolean {
    const symbol = intent.asset.symbol;
    const amount = BigInt(intent.amount);

    // 1. Check Max Budget
    if (this.config.maxMissionBudget[symbol]) {
      const maxBudget = BigInt(this.config.maxMissionBudget[symbol]);
      if (amount > maxBudget) {
        console.error(`[Fiduciary] Intent amount ${amount} exceeds budget ${maxBudget} for ${symbol}`);
        return false;
      }
    }

    // 2. Check Blocked Providers
    if (this.config.blockedProviders.includes(intent.seller)) {
      console.error(`[Fiduciary] Seller ${intent.seller} is blocked.`);
      return false;
    }

    return true;
  }
}
