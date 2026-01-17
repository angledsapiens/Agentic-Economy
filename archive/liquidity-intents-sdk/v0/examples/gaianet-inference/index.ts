import { LiquidityIntent } from '../../src/core/intent';
import { LIP_TEXT } from '../../src/core/constants';
import { USDC_ASSET } from '../../src/core/assets';
import { HandshakeSigner } from '../../src/handshake/signer';
import { SettlementEngine } from '../../src/settlement/engine';
import { Attestor } from '../../src/verifier/attestor';
import { EXAMPLE_SELLER_PRIVATE_KEY, EXAMPLE_BUYER_ADDRESS, EXAMPLE_PROVIDER_DID } from '../../src/config/env';

async function main() {
  console.log("Starting Gaianet Inference Example...");

  // 1. Setup Actors
  const sellerKey = EXAMPLE_SELLER_PRIVATE_KEY;
  const signer = new HandshakeSigner(sellerKey);
  const settlement = new SettlementEngine();
  const attestor = new Attestor();

  const providerDID = EXAMPLE_PROVIDER_DID;

  // 2. Pre-flight Reputation Check
  const isReputable = await settlement.preFlightReputationCheck(providerDID);
  if (!isReputable) {
    console.error("Provider failed reputation check!");
    return;
  }
  console.log("Provider passed reputation check.");

  // 3. Create Intent
  const intent: LiquidityIntent = {
    id: "intent-123",
    buyer: "0xBuyer...",
    seller: signer.getAddress(),
    asset: USDC_ASSET,
    amount: "1000000", // 1 USDC
    envelopeType: LIP_TEXT,
    deadline: Date.now() + 3600000
  };

  // 4. Sign Handshake with Feedback Authorization
  const signature = await signer.signIntent(intent, true);
  console.log(`Signed Handshake: ${signature}`);

  // 5. Lock Funds (Settlement)
  await settlement.lockFunds(intent);

  // ... (Data delivery and verification would happen here) ...

  // 6. Push Outcome Attestation
  const attestationId = await attestor.pushOutcomeAttestation(intent.id, 'SUCCESS');
  console.log(`Mission Complete. Attestation ID: ${attestationId}`);
}

main().catch(console.error);
