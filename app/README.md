# Autonomous Commerce Dashboard (Observer UI)

**Track**: Dev Tools / Autonomous Commerce
**Network**: ARC Testnet (Chain ID 5042002)

The **Commerce Dashboard** is a "Mission Control" UI designed to make agentic activity visible and trustworthy. It is **Read-Only** and designed for observers and auditors (like Hackathon Judges) to verify agent behavior.

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
