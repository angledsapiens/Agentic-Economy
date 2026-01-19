# Liquidity Intents SDK (LIS) v1 Core

The **LIS Core** (`aiconomy-arc-hackathon-sf`) is the fiduciary runtime for Autonomous Agents. It allows AI models to hold wallets and spend money *safely* by enforcing deterministic policies before any transaction hits the chain.

## Features

-   **Intents-Based Architecture**: Agents sign "Intents" (I want to buy X for Y), not raw transactions.
-   **Fiduciary Guardian**: A purely deterministic logic layer that approves/rejects intents based on a `Policy.json` (Daily Limits, Whitelists).
-   **ARC Testnet Native**: Pre-configured for **ARC Testnet (Chain ID 5042002)** ensuring low-cost, fast settlement for agent-to-agent swarms.
-   **x402 Support**: Native implementation of the HTTP 402 Payment Required standard for machine-negotiated API access.

## Usage

This core library is consumed by the **CLI** and **Commerce App**. It is not intended to be run standalone by the end-user, but exports the `TreasuryManager`, `Guardian`, and `SettlementProvider` classes.

### Configuration
The runtime state is governed by:
-   `Policy.json`: Fiduciary limits.
-   `.env`: Private keys and RPC endpoints (ARC Testnet).

## License
MIT
