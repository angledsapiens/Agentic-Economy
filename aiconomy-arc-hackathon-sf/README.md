# LIS Agentic Economy (Dev Tools Track)

This repository contains the **Liquidity Intents SDK (LIS)**, a fiduciary runtime that enables AI agents to spend crypto safely.

For the **ARC Hackathon**, we address the core problem of **"Blind Spending"**: providing a deterministic policy layer that allows agents to hold their own keys and pay for services autonomously without draining their wallets.

## Repository Structure

| Directory | Purpose |
|ort | ------- |
| **`cli/`** | **Start Here**. The Developer Tooling to build and fund agents. |
| **`aiconomy-arc-hackathon-sf/`** | The Core Runtime (Fiduciary Logic & Treasury). |
| **`app/`** | The Observer UI (Visualizes the agent's state). |

## 🚀 Where to Start

👉 **[Go to the CLI Guide (Step-by-Step Onboarding)](./cli/README.md)** 👈

**Do not start with the App or Core.** The CLI will guide you through creating an agent, funding it, and running the demo.

## Prerequisites (Testnet)

Before running anything, ensure you have:
1.  **Node.js** (v18+)
2.  **Git**
3.  **Metamask** (or any EVM wallet) configured for **ARC Testnet**.
    -   *See [CLI README](./cli/README.md#1-prerequisites) for network details.*

## Definition of Done

You are finished with the demo when you have:
1.  Created an agent via CLI.
2.  Funded it with real ARC Testnet USDC.
3.  Executed an autonomous payment to the `/hire` endpoint.
4.  Verified the transaction on [ArcScan](https://testnet.arcscan.app).
