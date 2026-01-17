import { LiquidityIntent, IntentCommitment } from '../../src/core/intent';
import { LIP_JSON } from '../../src/core/constants';
import { NATIVE_ASSET } from '../../src/core/assets';
import { HandshakeSigner } from '../../src/handshake/signer';
import { SchemaValidator } from '../../src/verifier/schema';
import { SignatureVerifier } from '../../src/verifier/signatures';
import { EXAMPLE_SELLER_PRIVATE_KEY, EXAMPLE_BUYER_ADDRESS } from '../../src/config/env';

async function main() {
  console.log("Starting Olas Risk Score Example (LIP_JSON)...");

  // 1. Setup
  const sellerKey = EXAMPLE_SELLER_PRIVATE_KEY;
  const signer = new HandshakeSigner(sellerKey);
  const validator = new SchemaValidator();
  const verifier = new SignatureVerifier();

  // 2. Define Intent
  const intent: LiquidityIntent = {
    id: "intent-olas-1",
    buyer: EXAMPLE_BUYER_ADDRESS,
    seller: signer.getAddress(),
    asset: NATIVE_ASSET,
    amount: "100000000000000000", // 0.1 ETH
    envelopeType: LIP_JSON,
    deadline: Date.now() + 3600
  };

  // 3. Sign Handshake
  const signature = await signer.signIntent(intent);
  const commitment: IntentCommitment = { intentId: intent.id, signature };
  console.log(`Handshake Signed: ${signature}`);

  // 4. Verify Handshake
  const isValidSig = verifier.verifyHandshake(intent, commitment);
  console.log(`Handshake Valid: ${isValidSig}`);

  // 5. Simulate Delivery
  const deliveredData = JSON.stringify({ score: 85, risk: "low", source: "olas-ai" });
  console.log(`Delivered Data: ${deliveredData}`);

  // 6. Validate Schema
  const isValidSchema = validator.validate(deliveredData, LIP_JSON);
  console.log(`Schema Valid (LIP_JSON): ${isValidSchema}`);
}

main().catch(console.error);
