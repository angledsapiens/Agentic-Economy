# LIS Dev Tools CLI

> **Track**: Dev Tools

The **LIS CLI** is the fastest way to bootstrap an autonomous commerce agent. It abstracts away the complexity of key management, policy configuration, and on-chain registration into a simple interactive tool.

## Installation

```bash
cd cli
npm install
```

## Usage

Run the CLI dev harness:
```bash
npm run dev -- [command]
```

### Commands

#### 1. Initialization
```bash
npm run dev -- init
```
Interactive wizard to create a new Agent Verification Profile. Sets up your `Policy.json` and identity metadata.

#### 2. Policy Management
```bash
npm run dev -- policy set
```
Update your fiduciary limits (e.g., increase Daily Spend Limit to $100 USDC) on the fly without editing JSON.

#### 3. Publish to Registry
```bash
npm run dev -- publish erc8004
```
One-click registration on the **ARC Testnet**. Mints your AgentID and associates your payment endpoints on-chain.

#### 4. Treasury Inspection
```bash
npm run dev -- treasury
```
View real-time balances. Distinguishes between **Available** (spendable) and **Reserved** (locked in pending intents) funds.
