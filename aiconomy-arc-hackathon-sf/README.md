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

## Testing & Verified Deployment

### Deployment to EC2
1.  **Configure Environment**: Ensure `.env` is populated with `SELLER_PRIVATE_KEY` and `ARC_RPC_URL` (Testnet).
2.  **Deploy Code**: Transmit `src/` and `scripts/` to the server.
3.  **Start Service**:
    ```bash
    pm2 start src/server.ts --interpreter ./node_modules/.bin/ts-node --name lis-server
    ```

### Verified End-to-End Test (x402)
To verify the x402 payment flow against the real ARC Testnet:

1.  **Run Verification Script**:
    ```bash
    ./scripts/verify_e2e.sh
    ```
    This script will:
    -   Call `/hire` (expect 402).
    -   Execute a **real 0.1 USDC transaction** on ARC Testnet.
    -   Call `/hire` with the proof (expect 200).

2.  **View Reports**:
    -   See `EC2_E2E_REPORT.md` for the latest certified execution.
    -   See `TESTNET_EXECUTION_LOG.md` for transaction history.
