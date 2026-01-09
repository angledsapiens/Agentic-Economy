import dotenv from 'dotenv';
dotenv.config(); // Load .env before imports

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { SettlementEngine } from './settlement/engine';
import { CapabilityResolver } from './discovery/resolver';
import { ContractResolver } from './discovery/contract-resolver';
import { LiquidityIntent } from './core/intent';
import { EnvelopeType } from './core/constants';
import { DEFAULT_CHAIN_ID } from './config/env';

// Mock USDC Asset if not exported
const USDC_ASSET = {
  type: 'ERC20' as const,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  chainId: 8453,
  decimals: 6,
  symbol: 'USDC'
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SDK Components
const settlement = new SettlementEngine();
const resolver = new CapabilityResolver(
  process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  process.env.REGISTRY_ADDRESS // Optional: Set in .env if deployed
);

// --- Endpoints ---

// 1. Discovery: Get Agents
app.get('/agents', async (req, res) => {
  const capability = req.query.capability as string || 'LIP_TEXT';
  try {
    const dids = await resolver.findAgents(capability);
    // Mocking reputation/minPrice since Resolver currently returns strings
    const enriched = dids.map(did => ({
      did,
      capabilities: [capability],
      reputation: Math.floor(Math.random() * 20) + 80, // Mock 80-100
      minPrice: '1000'
    }));
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: 'Discovery failed' });
  }
});

// 2. Hire: Trigger Settlement
app.post('/hire', async (req, res) => {
  const { sellerDid, amount } = req.body;
  console.log(`[Server] Hiring ${sellerDid} for ${amount} units...`);

  const intent: LiquidityIntent = {
    id: `intent-${Date.now()}`,
    buyer: '0xBuyer...', // Mock Buyer
    seller: sellerDid.replace('did:pkh:', ''), // Extract address
    asset: USDC_ASSET,
    amount: amount || '1000000',
    envelopeType: EnvelopeType.LIP_TEXT,
    deadline: Date.now() + 3600000
  };

  try {
    const result = await settlement.lockFunds(intent);
    if (result) {
      res.json({ success: true, intentId: intent.id });
    } else {
      res.status(400).json({ success: false, error: 'Settlement Failed' });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Config: Read Policy
app.get('/config', (req, res) => {
  try {
    const p = path.resolve(__dirname, '../Policy.json');
    const data = fs.readFileSync(p, 'utf-8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read policy' });
  }
});

// 4. Config: Write Policy
app.post('/config', (req, res) => {
  try {
    const p = path.resolve(__dirname, '../Policy.json');
    fs.writeFileSync(p, JSON.stringify(req.body, null, 2));
    // Reload policy in Fiduciary (requires restart or notify logic, assuming simple restart for now)
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save policy' });
  }
});

// 5. Audits: Read Receipts (Mock for now, or scan dir)
app.get('/audits', (req, res) => {
  // TODO: scan local audit directory if implemented
  res.json([
    { id: `rcpt_${Date.now()}`, description: 'Mock Receipt from Server', timestamp: Date.now(), amount: '1000 USDC', status: 'VERIFIED' }
  ]);
});

// ... imports
import { AutoFaucet } from './playground/auto-faucet';
import { ethers } from 'ethers';

// ... existing code ...

app.listen(PORT, async () => {
  console.log(`LIG Dashboard Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.LIS_MODE || 'LOCAL'}`);
  console.log(`Registry: ${process.env.REGISTRY_ADDRESS}`);

  // Automated Initialization
  if (process.env.LIS_MODE !== 'LOCAL') {
    const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
    // Assuming single wallet from env or derived
    if (process.env.SELLER_PRIVATE_KEY) {
      const wallet = new ethers.Wallet(process.env.SELLER_PRIVATE_KEY, provider);
      console.log(`[Init] Checking stats for ${wallet.address}...`);
      await AutoFaucet.checkAndFund(wallet.address, provider);
    }
  }
});
