'use server';

import { SettlementEngine, EnvelopeType } from './sdk/index';
import { v4 as uuidv4 } from 'uuid';

// Instantiate Engine on Module Scope (Server-Side Singleton pattern recommended, but this works for POC)
// Note: In Next.js server actions, env vars from .env.local are available
const engine = new SettlementEngine({
  mode: 'TESTNET',
  rpcUrl: process.env.BASE_SEPOLIA_RPC,
  privateKey: process.env.SELLER_PRIVATE_KEY,
  circleApiKey: process.env.CIRCLE_API_KEY
});

export async function executeStrategyAction(formData?: FormData | { targetPrice: string; slippage: string }) {
  console.log("🚀 Executing Strategy via Server Action...");

  try {
    let targetPrice = "0";
    let slippage = "0";

    if (formData instanceof FormData) {
      targetPrice = formData.get('targetPrice') as string || "0";
      slippage = formData.get('slippage') as string || "0";
    } else if (formData) {
      targetPrice = formData.targetPrice;
      slippage = formData.slippage;
    }

    // Fiduciary Guardrails: Strict Validation
    if (isNaN(parseFloat(targetPrice)) || parseFloat(targetPrice) <= 0) {
      throw new Error("Invalid Target Price. Must be > 0.");
    }
    if (isNaN(parseFloat(slippage)) || parseFloat(slippage) < 0) {
      throw new Error("Invalid Slippage. Must be >= 0.");
    }

    const intent = {
      id: uuidv4(),
      buyer: "0x0000000000000000000000000000000000000000", // Treasury
      seller: "0xTargetAgent",
      amount: "1000000", // 1.00 USDC (Fixed for POC)
      asset: {
        symbol: "USDC",
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
        type: "ERC20" as any,
        chainId: 84532,
        decimals: 6
      },
      envelopeType: EnvelopeType.LIP_TEXT,
      deadline: Date.now() + 3600,
      // Pass tactical parameters as simple metadata for now (or part of the text envelope)
      parameters: {
        targetPrice,
        slippage
      }
    };

    console.log(`🔒 Locking Funds for Price: ${targetPrice}, Slippage: ${slippage}%`);
    const success = await engine.lockFunds(intent);

    if (success) {
      return { success: true, message: `Funds Locked. Intent ID: ${intent.id}` };
    } else {
      return { success: false, message: "Settlement Engine declined transaction." };
    }

  } catch (error: any) {
    console.error("❌ Execution Error:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
}
