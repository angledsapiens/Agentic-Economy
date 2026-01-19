# LIS Dev Tools CLI

**Track**: Dev Tools
**Network**: ARC Testnet (Chain ID 5042002)

## 🚀 First-Time User Flow

Follow this guide to launch your first autonomous agent and verify a real on-chain payment.

### 0. What You’re About To Do

-   You will launch an autonomous agent.
-   It will pay USDC on ARC Testnet.
-   You will see a real transaction on ArcScan.

### 1. Prerequisites

-   **Node.js** ≥ 18
-   **Git**
-   **ARC Testnet wallet** with USDC

⚠️ **Important**: On ARC, **USDC pays for gas**. You must have enough USDC to cover both the transfer amount and the gas fee.

### 2. Install the CLI

```bash
git clone https://github.com/angledsapiens/Agentic-Economy.git
cd Agentic-Economy/cli
npm install
```

**Verification:**
```bash
npm run dev -- --help
```

### 3. Create Your Agent

```bash
npm run dev -- init
```

-   **What happens**: Creates an identity profile (`profiles.json`) and a default execution policy.
-   **Success indicator**: `✔ Created Agent Profile`

### 4. Set Spending Rules

Configure the fiduciary limits to safe defaults for testing.

```bash
npm run dev -- set
```

**CRITICAL: Use these exact values:**
-   **Daily limit**: `2000000` (2 USDC)
-   **Auto-approve below**: `500000` (0.5 USDC)

**Why**: This ensures your agent can autonomously spend small amounts (like 0.1 USDC) without requiring manual sign-off ("Auto-approval"), but stops large drains.

### 5. Fund the Agent

The CLI "init" command generated a new wallet address for your agent.

1.  **Instruction**: Send USDC to the wallet address displayed in your terminal (from `init`).
2.  **Minimum recommended**: `1 USDC`

**Verify Balance**:
```bash
npm run dev -- treasury
```

-   Check **Total** and **Available**.
-   **Note**: Ensure you have enough USDC for gas, or transactions will fail.

### 6. Start the Paid Service (x402)

**What uses this?** The `/hire` endpoint below is a minimal **demo service**. It mimics a real AI Agent service (like "Image Generation" or "Consulting") that requires upfront payment. We use it to prove your agent can negotiate and pay autonomously.

Leave the CLI terminal open. Open a **new terminal window** and navigate to the core service directory:

```bash
cd ../aiconomy-arc-hackathon-sf
PORT=3001 npx tsx src/server.ts
```

**Expected logs**:
-   `Connected to ARC Testnet`
-   `ARCSettlementProvider initialized`

### 7. Trigger the Payment Flow

Now, act as the "Client" trying to hire the agent.

#### 7.1 Call without payment → 402/Payment Required

In a third terminal (or split pane):

```bash
curl -X POST http://localhost:3001/hire -H "Content-Type: application/json" -d '{}'
```

-   **Result**: `HTTP 402 Payment Required`
-   **Why**: The agent detected no payment proof. It rejected the request ("Insufficient funds").

#### 7.2 Pay Autonomously

This is the magic moment. The agent (running in the background) checks its policy. Since the required amount (0.1 USDC) is below your auto-approve limit (0.5 USDC), it **signs and broadcasts** the transaction automatically.

### 7.3 Retry with Proof → 200

The service executes the transaction on the **ARC Testnet**. Once confirmed, it delivers the service using the x402 protocol.

**At this point, you should observe:**
-   [ ] A transaction hash printed in the server logs (`0x...`)
-   [ ] Your wallet balance reduced by **0.1 USDC** (+ gas)
-   [ ] A resolvable Link on ArcScan (see next step)

### 8. Verify On-Chain

Go to ArcScan to see the real settlement:

`https://testnet.arcscan.app/tx/<tx_hash>`

You will see:
-   **From**: Your Agent's Wallet
-   **To**: The Service Wallet
-   **Value**: 0.1 USDC

### 9. What You Just Proved

-   **Autonomous spending**: The agent paid without you clicking "Confirm" in a wallet.
-   **Policy enforcement**: It only paid because the amount was within the rules you set.
-   **Real USDC settlement**: This was not a simulation. Value moved on-chain.
-   **No mocks**: Every step verified against the live blockchain.

### 10. Troubleshooting

-   **“Transfer amount exceeds balance”**: You ran out of USDC for gas. Send more USDC.
-   **Not enough USDC**: Your transfer amount was less than the required service fee.
-   **Server not running**: Check terminal #2. Is `src/server.ts` active?

### 11. What’s Next

-   **Publish ERC-8004**: Run `npm run dev -- publish erc8004` to register on-chain.
-   **Build your own paid endpoint**: Use the `verified_e2e.sh` script as a template.
-   **Deploy to production**: See `../aiconomy-arc-hackathon-sf/README.md`.

## ✅ You’re Done

You have successfully:
1.  **Initialized** an autonomous agent identity.
2.  **Configured** fiduciary spending limits.
3.  **Funded** the agent with real USDC.
4.  **Executed** an autonomous x402 payment on-chain.
5.  **Verified** the settlement trustlessly.

**Welcome to the Agentic Economy.**
