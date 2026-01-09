import pkg from '@agentic-economy/liquidity-intents-sdk-v0';
const { SettlementEngine } = pkg;
import type { LiquidityIntent } from '@agentic-economy/liquidity-intents-sdk-v0';

console.log("✅ Successfully imported SDK types and Runtime Engine.");

try {
  const engine = new SettlementEngine();
  console.log("✅ SettlementEngine instantiated successfully.");

  if (typeof engine.lockFunds === 'function') {
    console.log("✅ Verified API Method: lockFunds");
  } else {
    console.error("❌ method lockFunds missing!");
    process.exit(1);
  }
} catch (e) {
  console.error("❌ Implementation Failed:", e);
  process.exit(1);
}
