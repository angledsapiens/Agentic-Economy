# Circle Wallet Bridge Initialization

- [x] Generate 32-byte ENTITY_SECRET
- [x] Save secret to .env
- [x] Register Entity Secret Ciphertext
- [x] Save recovery data to recovery.json
- [x] Verify initialization status
- [x] Create Wallet Set ('Antigravity Treasury v1')
- [x] Save WALLET_SET_ID to .env
- [x] Create Treasury Wallet (BASE-SEPOLIA)
- [x] Save WALLET_ID to .env
- [x] Fund wallet via Circle Faucet
- [x] Verify wallet is LIVE and functional

## Fiduciary Layer Implementation
- [x] Create src/guardrails.ts with MissionConfig type
- [x] Implement validateSpend function with 5 USDC limit
- [x] Integrate guardrails into executePayment
- [x] Test budget enforcement

## Treasury Dashboard
- [x] Create TreasuryStatus.md artifact with FinTech design
- [x] Implement dynamic dashboard generator

## Budget Adjustments
- [x] Reduce maxBudget to 0.50 USDC for 1 USDC liquidity
- [x] Add USER_APPROVAL_THRESHOLD at 0.10 USDC

## Micro-Mission: Security Scan
- [x] Create mission budget (0.10 USDC)
- [x] Scan src/circle.ts for hardcoded secrets
- [x] Move USDC token address to .env
- [x] Execute REAL 0.01 USDC security scan payment
- [x] Verify transaction on Base Sepolia blockchain
- [x] Update treasury dashboard with transaction

## Real Transaction Test
- [x] Debug Circle SDK ESM/CommonJS issues
- [x] Fix fee configuration structure
- [x] Fix token parameter (tokenAddress + blockchain)
- [x] Obtain BASE Sepolia ETH for gas
- [x] Execute end-to-end transaction successfully
- [x] Fix mission budget initialization (0.10 USDC)
- [x] Fix mission budget initialization (0.10 USDC)
- [x] Investigate duplicate transaction issue (Diagnosed as SDK/Testnet retry bug)
- [x] Add UUID idempotency keys to prevent duplicates (SDK failing to respect this on retry)
- [x] Test idempotency key fix on blockchain (Duplicate persisted - Deferred)
- [x] Create SDK Patch Instructions for future agent
- [x] Implement Live Treasury Dashboard (Fetching real-time data from Circle API)
  - [x] Fixed dashboard file location sync (Writing to both Artifacts and Project Root)
  - [x] Refactored output to "Pure Markdown" for better human readability (removed raw HTML)
  - [x] Added disclaimer about duplicate transactions (Transparency)

## Mission Control Extension (Visual Dashboard)
- [x] Scaffold `mission-control` extension project
- [x] Implement `SidebarProvider` and Webview registration
- [x] Build React UI (Gauge, Burn Rate, Kill Switch)
- [x] Integrate Theme Sync & Data Polling
- [x] Create Testing Guide (`TESTING_GUIDE.md`)

## Robustness: Reviewer Experience
- [x] Update `DEMO_INSTRUCTIONS.md` to explain Simulated vs Real mode
- [x] Security Hardening: Move secrets to `.env` and create `.env.example`
- [x] Add GitHub Codespaces configuration (`.devcontainer`) for one-click demo
- [x] Fix VS Code debug configuration (`launch.json`) for Codespaces
- [x] Create `Dockerfile` for containerized headless demo

## Inter-Agent Commerce Demo
- [x] Create `src/demo_agent_handshake.ts` script
- [x] Implement `simulateInterAgentPayment` (0.01 USDC)
- [x] Mock 'Security Auditor' agent interaction
- [x] Add "demo" command to `package.json`
- [x] verify `npm run demo` works as expected

## Interactive Demo (VS Code UI)
- [x] Update `SidebarProvider.ts` to handle `approveDemo` message
- [x] Update `webview/index.tsx` with Interactive Demo State Machine (Request/Approve/Receipt)
- [x] Add "Simulate Agent Request" button
- [x] Refine Demo: Remove manual "Approve" button; implement "Guardrail Auto-Approval" visualization
- [x] Debug UI Crash (React Hook Order integrity)

# Phase 2: Robustness & Scaling

## Fix Duplicate Transactions (SDK Patch)
- [ ] Locate `node_modules/@circle-fin/developer-controlled-wallets`
- [ ] Apply patch to disable retry logic (prevent testnet duplicates)
- [ ] Verify fix with `npm run demo`
