# Agent Manager Handover Context
**Project:** Agentic Treasury (Circle Wallet Bridge)
**Status:** PoC Complete, Entering Phase 2 (Robustness)

## Current State
- **Budget**: ~0.96 USDC remaining (Base Sepolia Testnet).
- **Fiduciary Controls**: Active (Budget limit per task: 0.10 USDC).
- **Core Feature**: "Mission Control" VS Code Extension is live and functional.
- **Known Bug**: Circle SDK retries cause duplicate transactions on Testnet.

## Artifact Locations
I have persisted the session brain into the project root for easy access:
- **`task.md`**: Master checklist. **See "Phase 2" section for next steps.**
- **`walkthrough.md`**: Full history of what has been built and tested.
- **`TreasuryStatus.md`**: Live dashboard.
- **`implementation_plan.md`**: Last active plan (Demo Mode).

## Next Task: SDK Patching
We are currently in **Phase 2 #1: Fix Duplicate Transactions**.
1.  Navigate to `node_modules/@circle-fin/developer-controlled-wallets`.
2.  Modify the transaction creation logic to disable retry-on-timeout (or increase timeout) to prevent double-spending on the slow Sepolia testnet.
3.  Verify with `npm run demo`.

## Useful Commands
- `npm run demo`: Runs a 0.01 USDC inter-agent payment simulation.
- `npm run dev`: Starts the main agent loop.
