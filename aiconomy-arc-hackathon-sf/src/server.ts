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
import { InterpretedIntent, IntentType } from './core/interpretation';

// Mock USDC Asset if not exported
const USDC_ASSET = {
  type: 'ERC20' as const,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  chainId: 8453,
  decimals: 6,
  symbol: 'USDC'
};

const app = express();
const PORT = process.env.PORT || 3001; // 3001 to avoid conflict with Next.js app on 3000

app.use(cors());
app.use(express.json());

// Initialize SDK Components
const settlement = new SettlementEngine();
const resolver = new CapabilityResolver(
  process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network',
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

// 2. Hire: x402-Protected Commerce Endpoint
// Supports both GET and POST for demo convenience
const handleHireRequest = async (req: express.Request, res: express.Response) => {
  const { sellerDid, amount } = req.body || {};

  // Check for x402-proof header (simulated - in production would validate signature/tx hash)
  const x402Proof = req.headers['x402-proof'] as string;

  if (x402Proof) {
    // Happy path: proof provided, assume validated for demo
    console.log(`[x402] Payment proof received: ${x402Proof.substring(0, 20)}...`);
    res.status(200).json({
      success: true,
      message: 'Service delivered'
    });
    return;
  }

  // No proof provided - start x402 flow
  console.log(`[x402] Payment required for hire request`);

  // Create Interpreted Intent (Mocking the Interpreter step)
  const interpretedIntent: InterpretedIntent = {
    type: IntentType.BUY,
    counterparty: sellerDid ? sellerDid.replace('did:pkh:', '') : '0x000',
    reasoning: 'Direct Hire via Dashboard',
    subject: {
      name: 'LIP_TEXT_GEN',
      description: 'Human-initiated service request'
    },
    settlement: {
      asset: 'USDC',
      amount: amount || '1000000' // Default 1 USDC
    },
    metadata: {
      templateType: 'BUY_SERVICE',
      serviceName: 'Dashboard Service',
      sellerDID: sellerDid || 'unknown',
      maxPrice: amount || '1000000',
      description: 'Manual hire from dashboard'
    }
  };

  try {
    // Check Treasury balance before attempting reservation
    const treasurySnapshot = await settlement.getBalance('USDC');
    const treasuryBalance = treasurySnapshot.availableBalance;
    const requiredAmount = amount || '1000000';

    if (BigInt(treasuryBalance) < BigInt(requiredAmount)) {
      // Insufficient funds - return protocol-correct 402 with clean autonomous log
      console.log(`[x402] Insufficient funds — rejecting autonomously`);

      res.status(402).json({
        success: false,
        error: 'Payment required',
        reason: 'Insufficient USDC balance',
        required: requiredAmount,
        available: treasuryBalance
      });
      return;
    }

    // Attempt reservation
    const result = await settlement.reserve(interpretedIntent);

    if (result) {
      // Reservation succeeded - return 402 with payment challenge
      res.status(402).json({
        success: false,
        error: 'Payment required',
        reason: 'Awaiting x402 proof of payment',
        challenge: {
          amount: requiredAmount,
          asset: 'USDC',
          destination: sellerDid || 'seller',
          reservationId: result
        }
      });
    } else {
      // Settlement rejected by fiduciary guardian or failed
      console.log(`[x402] Settlement rejected — rejecting autonomously`);

      res.status(402).json({
        success: false,
        error: 'Payment required',
        reason: 'Settlement validation failed',
        required: requiredAmount,
        available: treasuryBalance
      });
    }
  } catch (e: any) {
    // Even on error, return 402 (not 500) - this is a payment protocol endpoint
    console.log(`[x402] Settlement error — rejecting autonomously`);

    res.status(402).json({
      success: false,
      error: 'Payment required',
      reason: e.message || 'Unable to process settlement',
      required: amount || '1000000',
      available: '0' // Unknown due to error
    });
  }
};

// Register /hire for both GET and POST
app.get('/hire', handleHireRequest);
app.post('/hire', handleHireRequest);

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
  console.log(`LIS Dashboard Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.LIS_MODE || 'LOCAL'}`);
  console.log(`Registry: ${process.env.REGISTRY_ADDRESS}`);

  // CRITICAL: Validate ARC Testnet connection
  if (process.env.LIS_MODE !== 'LOCAL' && process.env.ARC_RPC_URL) {
    const { validateARCNetwork } = await import('./config/network-validator');
    try {
      await validateARCNetwork(process.env.ARC_RPC_URL);
    } catch (error: any) {
      console.error('\n🚨 STARTUP FAILED: Network validation error');
      console.error(error.message);
      process.exit(1);
    }
  }

  // Automated Initialization
  if (process.env.LIS_MODE !== 'LOCAL') {
    const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
    // Assuming single wallet from env or derived
    if (process.env.SELLER_PRIVATE_KEY) {
      const wallet = new ethers.Wallet(process.env.SELLER_PRIVATE_KEY, provider);
      console.log(`[Init] Checking stats for ${wallet.address}...`);
      await AutoFaucet.checkAndFund(wallet.address, provider);
    }
  }
});
