# Agentic Economy (Liquidity Intents) 🤖💸

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/angledsapiens/Agentic-Economy)

## Vision
The **Agentic Economy** is a future where autonomous AI agents can transact, hire one another, and exchange value natively on-chain without human intervention.
This repository serves as the foundational monorepo for tools, frameworks, and protocols that power this vision—specifically forcing on **Liquidity Intents** (the ability for agents to express financial will).

## Projects

### 1. [IDE Treasury (PoC)](./ide-treasury)
**Mission Control for Autonomous Agents.**
A Proof-of-Concept demonstrating:
-   **Fiduciary Guardrails**: Agents self-regulating spending limits.
-   **Inter-Agent Commerce**: Automated service payments (Agent-to-Agent).
-   **Mission Control**: A human-in-the-loop dashboard for monitoring burn rates and emergency overrides.

---
*Built with [Circle Developer Controlled Wallets](https://developers.circle.com) and the Agentic Web.*

---

# 🚀 Demo Instructions: IDE Treasury

Welcome! This repository demonstrates **Autonomous Inter-Agent Commerce** with a human-in-the-loop "Mission Control" interface.

## 🎯 The Core Feature
We have built a **VS Code Extension** that acts as a cockpit for AI Agents. It allows you to:
1.  **Visualize** agent liquidity (Real-time USDC balance).
2.  **Monitor** burn rate.
3.  **Simulate** an autonomous agent transaction (0.01 USDC).
4.  **Override** agent autonomy with a "Critical Stop" kill switch.

---

## ⚡ Quick Start (The "Golden Path")

### 1. Prerequisites
- **VS Code** installed.
- **Node.js** (v18+) installed.

### 2. Setup
1.  Open this folder in VS Code.
2.  Install dependencies:
    ```bash
    npm install
    cd mission-control
    npm install
    ```
3.  **Authentication**:
    *   Copy `.env.example` to `.env`.
    *   Fill in your `CIRCLE_API_KEY` and `ENTITY_SECRET`.
    *   (Optional) If you don't have a wallet, run `npx tsx src/initialize.ts` to generate one.

### 3. Launch "Mission Control"
1.  Open the `mission-control` folder in VS Code.
2.  Press **`F5`** to launch the Extension Host.
3.  In the new window, click the **Circle Icon** in the left sidebar.

### 4. Running the Interactive Demo
Only have 2 minutes? Do this:

1.  **Click "⚡ Simulate Agent Request"** in the sidebar.
    *   *What happens?* The system simulates an incoming payment request from a "Security Auditor" agent.
2.  **Watch the "Agentic" Flow**:
    *   You will see the agent **self-validate** against the Fiduciary Guardrails (Budget < 0.10 USDC, Trust Score OK).
    *   It will **Auto-Approve** (no human click needed!).
3.  **View the Receipt**:
    *   A **Green Receipt** will appear with a real Transaction ID.
    *   The system will auto-sync the ledger after 3 seconds.

### 5. Verify the "Realness"
This is not a mock. It executed a **Real On-Chain Transaction** on Base Sepolia.
Check the generated `TreasuryStatus.md` file in the root directory to see the latest ledger entry.

---

## 🛡️ Safety Features to Test
- **Critical Stop**: Click the **Red Button**. It creates a `STOP.LOCK` file that physically prevents the agent code from signing transactions.
- **Unlock**: Use the Green "Unlock" button to restore authority.
