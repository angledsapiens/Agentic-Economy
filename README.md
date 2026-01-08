# Liquidity Intents SDK (LIS)

> **The Fiduciary Rail for the Agentic Economy.**

As AI agents evolve into autonomous economic actors, they face a fundamental bottleneck: the **Credit Wall**. While agents can plan and execute complex workflows, they lack the native infrastructure to negotiate, authorize, and settle payments for the tools and services they require.

The **Liquidity Intents SDK (LIS)** provides the "Vascular System" for this new economy. It is a secure, intent-centric protocol that enables agents to function as independent financial entities within predefined fiduciary boundaries.

---

## 🏛️ Bridging the Autonomy Gap

Modern agentic workflows often require high-frequency, low-latency exchange of value. LIS standardizes these interactions through a **Commit-Verify-Settle** architecture, ensuring that every transaction is cryptographically backed by proof of work.

*   **Autonomous Discovery**: Utilizing the **ERC-8004** standard, agents can resolve capabilities to identities via a decentralized "Yellow Pages" registry.
*   **Fiduciary Guardrails**: Human owners delegate mission-scoped budgets to agents. The SDK enforces these limits on-chain, preventing unauthorized spend while allowing sub-second autonomous settlement.
*   **Verifiable Settlement**: Payments are only released when the delivery of a signed data artifact matches the initial cryptographic handshake.

---

## 🛠️ The Protocol Stack

LIS is built on top of battle-tested Web3 primitives to ensure maximum security and interoperability across the **Base** and **Avalanche** ecosystems.

| Layer | Component | Function |
| :--- | :--- | :--- |
| **Identity** | **ERC-8004** | Portable, NFT-based AgentIDs for trustless discovery. |
| **Messaging** | **EIP-712** | Structured, machine-readable "Intents" for transparent negotiation. |
| **Liquidity** | **Circle SDK** | Smart Intent Locks (Escrow) for programmable USDC settlement. |
| **Reputation** | **EAS** | On-chain attestations to track agent reliability globally. |
| **Compliance** | **Zk-Receipts** | Non-repudiable JSON-LD artifacts for automated accounting (QuickBooks/Xero). |

> [!IMPORTANT]
> **Fiduciary Safety First**: Unlike traditional wallets, LIS agents operate under strict policy logic defined in `Policy.json`. This ensures that even if an agent hallucinates, it cannot drain treasury funds or sign unauthorized contracts.

---

## 🔄 The Lifecycle of an Intent

1.  **Intent Broadcast**: A **Buyer** agent generates a signed request specifying the task, budget, and required data schema.
2.  **Handshake Agreement**: A **Seller** agent signs a commitment to perform the work, triggering a **Smart Intent Lock**.
3.  **Execution & Delivery**: The Seller delivers the signed work artifact (JSON, URL, or Hash) to the SDK.
4.  **Atomic Payout**: The Settlement Engine validates the signature and releases funds from the vault instantly.

---

## 🚀 Future Roadmap: Toward a Global Marketplace

The current **v0** focuses on the foundational discovery and settlement rails. As the ecosystem matures, the protocol will evolve into a fully decentralized Agentic Marketplace:

*   **v0**: Trust-based on-chain Registry, Signature-verified Handshakes, and Local/Testnet Playground.
*   **v1**: Economic Incentives. Staked reputation (Slashing), Cross-Chain CCTP Intents, and "LLM-as-a-Judge" for subjective task verification.

---

## Getting Started

Start with the [Liquidity Intents SDK v0](./liquidity-intents-sdk/v0) to integrate payments into your agents today.

```bash
cd liquidity-intents-sdk/v0
./scripts/bootstrap.sh
```
