# Autonomous Commerce Dashboard (Observer UI)

**Track**: Dev Tools / Autonomous Commerce
**Network**: ARC Testnet (Chain ID 5042002)
**Prerequisite**: You MUST complete the **[CLI Setup](../cli/README.md)** first.

## 🛑 STOP! Read This First
The Commerce Dashboard is an **optional** verification tool. It does *not* participate in the transaction logic.
-   **Go to [CLI](../cli/README.md)** to build and fund your agent.
-   Come back here only when you want to visualize the results.

## What is this Demo?
This dashboard visualizes the **`/hire` x402 flow**:
1.  **402 Payment Required**: Server rejects request.
2.  **On-Chain Settlement**: Agent pays USDC on ARC.
3.  **Verification**: Server checks ArcScan before returning 200 OK.

> **Note**: This UI is **optional**. It exists primarily for observability during demos and reviews; the CLI works independently.

## Key Features (What to Look For)

1.  **Real-Time Treasury Card**:
    -   Top Left Card.
    -   Shows **Total**, **Available**, and **Locked** USDC.
    -   **Source**: Live query of the ARC Testnet blockchain.

2.  **Activity Feed**:
    -   Central Console.
    -   Logs every step of the negotiation: "Proposal Received" -> "Policy Check" -> "Transaction Broadcast".
    -   **Clickable Links**: Transaction hashes link directly to **ArcScan**.

3.  **Policy Visualizer**:
    -   Top Right Card.
    -   Displays the active `Policy.json` (e.g., "Daily Limit: $2.00").
    -   Proves the agent is constrained by code, not human intervention.

## Setup & Running

This UI connects to the LIS Core (`../aiconomy-arc-hackathon-sf`).

1.  **Install**:
    ```bash
    cd app
    npm install
    ```

2.  **Run**:
    ```bash
    npm run dev
    ```

3.  **View**:
    Open [http://localhost:3000](http://localhost:3000).

## Architecture

This app uses a **Thin Adapter** pattern. It does not maintain its own database. Instead, Next.js API routes bridge directly to the Core Runtime to read:
-   `Policy.json` (Configuration)
-   `TESTNET_EXECUTION_LOG.md` (Logs)
-   `package.json` (Identity)

### Final Note for Judges

If you see transactions in the **Activity Log**, they are **Real**. Click the hash to verify settlement on the ARC Testnet explorer.
