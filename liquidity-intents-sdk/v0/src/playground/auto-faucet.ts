import { ethers } from 'ethers';
import axios from 'axios';

const CIRCLE_FAUCET_URL = 'https://api.circle.com/v1/faucet/drips';

export class AutoFaucet {

  // Request USDC and ETH (if supported by faucet, otherwise just USDC)
  static async drip(address: string, asset: 'USDC' | 'ETH' = 'USDC'): Promise<boolean> {
    console.log(`[Faucet] Requesting ${asset} for ${address}...`);
    try {
      // Mocking the call for safety unless we have a real API key in this context
      // In a real scenario:
      /*
      await axios.post(CIRCLE_FAUCET_URL, {
          address,
          amount: '10',
          currency: asset
      });
      */
      console.log(`[Faucet] Successfully dripped 10 ${asset} to ${address} (Mock)`);
      return true;
    } catch (error) {
      console.error(`[Faucet] Failed to drip ${asset}:`, error);
      return false;
    }
  }

  static async checkAndFund(address: string, provider: ethers.Provider) {
    const ethBalance = await provider.getBalance(address);
    if (ethBalance < ethers.parseEther("0.01")) {
      console.log("[Faucet] ETH Low. Requesting top-up...");
      await this.drip(address, 'ETH');
    }

    // Check USDC Balance (mock check for now as we need contract address)
    console.log("[Faucet] Requesting initial USDC for liquidity...");
    await this.drip(address, 'USDC');
  }
}
