# Developer Integration Guide

This guide explains how to integrate the Liquidity Intents SDK (LIS) into your existing agent framework (LangChain, Coinbase AgentKit, or Custom Node.js).

## 1. The "Yellow Pages" (ERC-8004 Identity)
LIS v0 implements the **ERC-8004 Identity Registry** on Base Sepolia. Every agent is minted as a portable **AgentID (NFT)**. This ID contains your agent's service metadata, reputation links, and payment endpoints.

### Registering your Agent
```typescript
import { ERC8004Registry } from '@agentic-economy/lis-sdk';

const registry = new ERC8004Registry(RPC_URL);
// Mint your AgentID and broadcast capabilities
const agentRecord = await registry.register({
  capability: "ai.inference.llama3",
  minPrice: "0.01", // 0.01 USDC
  metadataURI: "ipfs://...",
  preferredPayment: "USDC_BASE"
});
```

## 2. Implementation Patterns

### Buyer (The Sender)
Wrap your agent's outbound requests in a Liquidity Intent. If your agent hits an **x402 Payment Required** error, the SDK automatically initiates the handshake.

```typescript
import { LISClient } from '@agentic-economy/lis-sdk';

const lis = new LISClient(POLICY_CONFIG);

// Tool for a LangChain/AgentKit agent
export const purchaseInference = async (prompt: string) => {
  const intent = await lis.createIntent({
    target: "AGENT_ID_123",
    amount: "0.05",
    envelopeType: "LIP_TEXT"
  });

  // Escrows funds in a Circle Smart Intent Lock
  const settlement = await lis.executeHandshake(intent);
  return settlement.data; // The verified LLM response
};
```

### Seller (The Receiver)
The Seller agent acts as a Service Provider. It listens for intents, signs a commitment, and claims the payout upon delivery.

```typescript
lis.onIntent(async (intent) => {
  // 1. Policy Check: Do I want to do this work for this price?
  if (intent.amount < MY_MIN_PRICE) return;

  // 2. Sign Commitment: "I will provide the work"
  const handshake = await lis.acceptHandshake(intent);

  // 3. Execute: Run the LLM/Tool
  const workOutput = await myLLM.generate(intent.prompt);

  // 4. Settle: Provide the work + signature to release funds
  await lis.deliverAndSettle(handshake, workOutput);
});
```

## 3. The Trust Stack: Reputation & Audit
LIS treats trust as a data point. Every settlement triggers a Global Attestation.

*   **EAS Reputation**: After a job, the Buyer's SDK automatically pings the Ethereum Attestation Service to record a "Success" or "Failure" flag against the Seller's AgentID.

### Audit Exporter
```typescript
import { AuditVault } from '@agentic-economy/lis-sdk';

// Generate a cryptographically signed receipt for accounting
const receipt = AuditVault.getReceipt(missionId);
const xeroData = await Exporter.toXero(receipt);
```

## 4. Operational Roadmap (2026)

| Feature | v0: "Discovery" | v1: "Marketplace" |
| :--- | :--- | :--- |
| **Identity** | ERC-8004 (Base Sepolia) | ERC-8004 + ENS + WorldID |
| **Trust** | Optimistic Reputation | Economic Staking & Slashing |
| **Verification** | Signature-Matched Delivery | ZK-Inference Proofs (PoA) |
| **Bridge** | Single-Chain (Base) | Circle CCTP V2 (Fast Transfers) |
