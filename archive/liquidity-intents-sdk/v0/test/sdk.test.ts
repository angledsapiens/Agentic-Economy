import { HandshakeSigner } from '../src/handshake/signer';
import { SettlementEngine } from '../src/settlement/engine';
import { SignatureVerifier } from '../src/verifier/signatures';
import { SchemaValidator } from '../src/verifier/schema';
import { LiquidityIntent } from '../src/core/intent';
import { LIP_TEXT } from '../src/core/constants';
import { USDC_ASSET } from '../src/core/assets';
import { EXAMPLE_SELLER_PRIVATE_KEY, EXAMPLE_BUYER_ADDRESS } from '../src/config/env';

describe('Liquidity Intents SDK v0 Integration', () => {
  const sellerKey = EXAMPLE_SELLER_PRIVATE_KEY;
  const signer = new HandshakeSigner(sellerKey);
  const settlement = new SettlementEngine();
  const verifier = new SignatureVerifier();
  const validator = new SchemaValidator();

  const intent: LiquidityIntent = {
    id: "test-intent-1",
    buyer: EXAMPLE_BUYER_ADDRESS,
    seller: signer.getAddress(),
    asset: USDC_ASSET,
    amount: "1000000",
    envelopeType: LIP_TEXT,
    deadline: Date.now() + 3600000
  };

  it('should sign and verify a handshake successfully', async () => {
    const signature = await signer.signIntent(intent, true);
    expect(signature).toBeDefined();
    expect(signature.startsWith('0x')).toBe(true);

    const isValid = verifier.verifyHandshake(intent, { intentId: intent.id, signature }, true);
    expect(isValid).toBe(true);
  });

  it('should validate LIP_TEXT schema correctly', () => {
    const data = "Hello World";
    expect(validator.validate(data, LIP_TEXT)).toBe(true);
    expect(validator.validate(123, LIP_TEXT)).toBe(false);
  });

  it('should simulate funds locking via Circle SDK stub', async () => {
    const result = await settlement.lockFunds(intent);
    expect(result).toBe(true);
  });
});
