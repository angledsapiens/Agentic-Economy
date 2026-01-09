import { Scout } from './lib/flankr-engine/scout.ts';

async function main() {
  console.log("🔍 Initializing Flankr Scout...");

  // Use Sepolia RPC and Registry
  const RPC = "https://sepolia.base.org";
  const REGISTRY = "0x2b63E8F0FaE1059e69FFeEAB82a60f1bDbde0E39";

  const scout = new Scout(RPC, REGISTRY);

  console.log("📡 Scanning for targets (Capability: LIP_CHAOS_TEST)...");
  const targets = await scout.scanForTargets("LIP_CHAOS_TEST");

  console.log(`🎯 Found ${targets.length} targets.`);
  targets.forEach(t => {
    console.log(`   - [${t.score}% Threat] ${t.address} (${t.capability})`);
  });
}

main().catch(console.error);
