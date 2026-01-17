# Autonomous Commerce Dashboard

> **Track**: Autonomous Commerce

The **Commerce Dashboard** is a "Mission Control" UI designed to make agentic activity visible and trustworthy. It connects strictly to the LIS Core in *Read-Only* mode to visualize the financial and operational state of the agent.

## Features

-   **Observer-First Design**: Built for judges and auditors, not for wallet management.
-   **Real-Time Treasury**: visualizing `Available` vs `Locked` capital.
-   **Activity Feed**: A scrolling terminal view of `x402` payment negotiation logs.
-   **Policy Visualizer**: Human-readable display of the active Fiduciary Policy.

## Setup

1.  **Install Constraints**:
    ```bash
    cd app
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open**: Visit `http://localhost:3000`.

## Architecture
This app uses a **Thin Adapter** pattern. It does not maintain its own database. Instead, Next.js API routes bridge directly to the `../aiconomy-arc-hackathon-sf` core directory to read:
-   `Policy.json` (Configuration)
-   `TESTNET_EXECUTION_LOG.md` (Logs)
-   `package.json` (Identity)
