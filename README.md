# Agentic Economy Monorepo

Welcome to the Agentic Economy infrastructure repository.

## Workspaces

- **[Liquidity Intents SDK v0](./liquidity-intents-sdk/v0)**: Core protocol for agent-to-agent commerce and settlement.
- **[IDE Treasury](../ide-treasury)**: Proof-of-concept implementations and treasury management tools.

## Getting Started

This repository uses `pnpm` workspaces.

```bash
pnpm install
```

---

# Liquidity Intents SDK (LIS)

> **The Fiduciary Rail for the Agentic Economy.**

As AI agents evolve into autonomous economic actors, they face a fundamental bottleneck: the **Credit Wall**. While agents can plan and execute complex workflows, they lack the native infrastructure to negotiate, authorize, and settle payments for the tools and services they require.

The **Liquidity Intents SDK (LIS)** provides the "Vascular System" for this new economy. It is a secure, intent-centric protocol that enables agents to function as independent financial entities within predefined fiduciary boundaries, solving the HTTP **402 Payment Required** error at the protocol level.

## 🏛️ The x402 Protocol Standard

Modern agentic workflows often require high-frequency, low-latency exchange of value. LIS standardizes these interactions through the **x402 Protocol**, a transport layer for machine-to-machine value exchange.

*   **Identity (ERC-8004)**: Transitioning from static registries, agents are now issued **Identity NFTs** on Base Sepolia. These portable AgentIDs accrue reputation and history.
*   **Transport (x402)**: LIS provides the "Wallet-to-Agent" logic. When an agent encounters a "Payment Required" gate, LIS automatically negotiates and authorizes the transfer.
*   **Reputation (EAS)**: Trust is no longer blind. The **Ethereum Attestation Service (EAS)** powers a global reputation score for every AgentID, ensuring interactions are bonded by history.

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

## 🔄 The Lifecycle of an Intent

1.  **Intent Broadcast**: A **Buyer** agent generates a signed request specifying the task, budget, and required data schema.
2.  **Handshake Agreement**: A **Seller** agent signs a commitment to perform the work, triggering a **Smart Intent Lock**.
3.  **Execution & Delivery**: The Seller delivers the signed work artifact (JSON, URL, or Hash) to the SDK.
4.  **Atomic Payout**: The Settlement Engine validates the signature and releases funds from the vault instantly.

## 🚀 Future Roadmap: Toward a Global Marketplace

The current **v0** focuses on the foundational discovery and settlement rails. As the ecosystem matures, the protocol will evolve into a fully decentralized Agentic Marketplace:

*   **v0**: Trust-based ERC-8004 Registry, Signature-verified Handshakes, and EAS Reputation.
*   **v1**: Economic Incentives. Staked reputation (Slashing), **Circle CCTP V2** for sub-30s Cross-Chain settlement, and "LLM-as-a-Judge" verification.

## Getting Started

Start with the [Liquidity Intents SDK v0](./liquidity-intents-sdk/v0) to integrate payments into your agents today.

```bash
cd liquidity-intents-sdk/v0
./scripts/bootstrap.sh
```
