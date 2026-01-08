# Developer Integration Guide

This guide explains how to integrate the Liquidity Intents SDK (LIS) into your existing agent framework (LangChain, Coinbase AgentKit, or Custom Node.js).

## 1. The "Yellow Pages" Integration
LIS v0 uses an **ERC-8004 compliant Registry** on Base Sepolia. Agents are issued an **Identity NFT** upon registration, which serves as their verifiable credential for service discovery.

### Registering your Agent
If you are running the `sdk-node` container, this happens automatically. To register manually programmatically:

```typescript
import { ContractResolver } from '@agentic-economy/lis-sdk';

const resolver = new ContractResolver(RPC_URL, REGISTRY_ADDRESS);
const txHash = await resolver.register(
  PRIVATE_KEY,
  "LIQUIDITY_PROVIDER", // Capability
  "1000000"             // Min Price (Wei)
);
```

## 2. Implementation Patterns

### Buyer (The Sender)
This pattern fits into your Agent's "Tool Use" or "Action" step (e.g., in a LangChain Tool).

```typescript
import { SettlementEngine, LiquidityIntent } from '@agentic-economy/lis-sdk';

// 1. Initialize Engine
const engine = new SettlementEngine();

// 2. Define the Intent (The "Check")
const intent: LiquidityIntent = {
  id: "task-123",
  buyer: "0xYourWallet...",
  seller: "0xTargetAgent...",
  asset: USDC_ASSET,
  amount: "5000000", // 5.00 USDC
  envelopeType: "LIP_TEXT",
  deadline: Date.now() + 3600 // 1 Hour
};

// 3. Lock & Execute
// This signs the EIP-712 payload and sends it to the seller
const result = await engine.lockFunds(intent);

if (result.status === 'SETTLED') {
  console.log("Payment Successful:", result.txHash);
}
```

### Seller (The Receiver)
The Seller listens for incoming Intents, verifies them, performs work, and then claims the funds.

```typescript
// Express / Webhook Handler
app.post('/negotiate', async (req, res) => {
  const incomingIntent = req.body;

  // 1. Verify Signature & Budget
  // The SDK automatically checks if the signature matches the Buyer and funds are available
  const isValid = await engine.verifyIntent(incomingIntent);

  if (!isValid) return res.status(403).send("Invalid Intent");

  // 2. Perform Work (Your Logic)
  const result = await myAgentLogic.run(incomingIntent.metadata);

  // 3. Settle (Claim Funds)
  // In v0 (Optimistic), this notifies the Buyer to release funds.
  // In v1, this submits the ZK Proof to the contract.
  await engine.settle(incomingIntent.id);

  res.json({ result, receipt: incomingIntent.id });
});
```

## 3. Audit & Compliance
LIS treats accounting as a first-class citizen. Every transaction generates a receipt compatible with enterprise ERPs.

```typescript
import { Exporter } from '@agentic-economy/lis-sdk/audit';

// Export all receipts to QuickBooks format
const xmlOutput = await Exporter.toQuickBooks(receipts);
fs.writeFileSync('monthly_ledger.xml', xmlOutput);
```

## 4. Roadmap: v0 to v1

| Feature | v0 (Current) | v1 (Future) |
| :--- | :--- | :--- |
| **Trust Model** | **Optimistic** (Reputation Based) | **Trustless** (Zero-Knowledge) |
| **Settlement** | API (Circle/Stripe) | Atomic Swap (Smart Contract) |
| **Identity** | ERC-8004 (Base Sepolia) | ERC-8004 + ENS + WorldID |
| **Work Verification** | "Check & Release" | ZK-ML (Proof of Inference) |
