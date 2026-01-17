# Mission: Inter-Agent Commerce Demo

## Goal
Implement a "Demo Mode" to showcase the future of autonomous inter-agent value exchange. This involves simulating a handshake between the "Coder" agent (us) and a "Security Auditor" agent, culminating in a real 0.01 USDC payment.

## User Review Required
No major architectural changes. Just adding a standalone script.

## Proposed Changes

### [New Script]
#### [NEW] [demo_agent_handshake.ts](file:///f:/Projects/Agentic Treasury/src/demo_agent_handshake.ts)
- Will run as a standalone script using `ts-node`.
- **Workflow**:
    1. Log: `[SYSTEM] Agent 'Coder' hiring Agent 'Auditor'...`
    2. Wait 3 seconds (simulating negotiation/audit).
    3. Call `executePayment('0.01', 'TEST_ADDRESS', 'demo-mission')`.
    4. Log: `[SUCCESS] 0.01 USDC transferred via <txId>.`

### [Configuration]
#### [MODIFY] [package.json](file:///f:/Projects/Agentic Treasury/package.json)
- Add `"demo": "npx tsx src/demo_agent_handshake.ts"` to `scripts`.

## Verification Plan
### Automated Tests
- Run `npm run demo` and verify:
    - Console output matches requirements.
    - Transaction ID is displayed.
    - `mission-control` dashboard updates (since it's a real tx).
### Manual Verification
- Check Base Sepolia explorer for the new 0.01 USDC tx.
