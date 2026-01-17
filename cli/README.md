# LIS CLI - Agentic Commerce Dev Tools

This CLI is the developer surface for the **Liquidity Intents SDK (LIS)**. It allows developers to go from zero to a fully configured autonomous commerce agent in under 5 minutes.

## Features

- **Profile Management**: Initialize or select standardized Commerce Profiles.
- **Policy Configuration**: Set daily spend limits and approval thresholds without touching code.
- **On-Chain Publishing**: One-command publishing of Agent Capabilities to the ERC-8004 Registry (Base Sepolia).
- **x402 Micropayments**: Enable and configure autonomous payment handling.
- **Treasury Inspection**: View real-time available vs. reserved balances.

## Architecture

This CLI is a thin orchestration layer that sits on top of the `aiconomy` core infrastructure. It demonstrates that LIS is a platform, not just a single application.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run CLI**
   ```bash
   npm run dev -- --help
   ```

3. **Initialize Agent**
   ```bash
   npm run dev -- init
   ```
