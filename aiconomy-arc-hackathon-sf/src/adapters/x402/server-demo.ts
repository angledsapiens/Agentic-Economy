import { X402Client } from './client';
import { X402Server } from './middleware';
import { SettlementEngine } from '../../settlement/engine';
import { CommerceProfile, ProfileStatus, DEFAULT_POLICY } from '../../core/profile';
import * as dotenv from 'dotenv';
import { HEADER_L402_PRICE, HEADER_AUTHORIZATION } from './types';

// Load ENV
dotenv.config();

/**
 * x402 End-to-End Demo (Sprint 5B: Clarity Pass)
 *
 * Simulates a Buyer (Client) paying a Seller (Server) for generated text.
 * Demonstrates:
 * 1. 402 Payment Required Challenge
 * 2. On-Chain Settlement (Simulated/Live)
 * 3. x402-proof Header Authorization
 */
async function runDemo() {
  console.log('--- Starting x402 Micropayment Demo ---');

  // --- 1. SETUP SELLER (Server) ---
  const sellerDID = 'did:pkh:seller-address';
  const server = new X402Server(sellerDID);

  // Set Price: 1 USDC for Text Gen
  server.setPrice('/gen-text', '1000000');

  // --- 2. SETUP BUYER (Client) ---
  const buyerProfile: CommerceProfile = {
    id: 'did:pkh:buyer',
    name: 'Autonomous Agent',
    address: '0xBuyerAddress',
    controlledBy: 'user',
    status: ProfileStatus.ACTIVE,
    capabilities: [],
    activePolicyId: 'policy-default-000',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const settlement = new SettlementEngine();

  // Create Client with injected "fetch" that calls our mock server
  const client = new X402Client(buyerProfile, DEFAULT_POLICY, settlement, async (url, options) => {
    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 50));
    const path = '/' + url.split('/').pop();

    // Log outbound headers for visibility
    const auth = options.headers?.[HEADER_AUTHORIZATION];
    if (auth) {
      console.log(`[Network] Outbound Request: ${url} | Auth: ${auth}`);
    } else {
      console.log(`[Network] Outbound Request: ${url} | No Auth`);
    }

    // Call Server Middleware
    return await server.handleRequest(path, options.headers || {});
  });

  // --- 3. EXECUTE TRANSACTION ---

  console.log('\n[Action] Agent requesting /gen-text resource...');

  try {
    const response = await client.fetch('http://api.service/gen-text');

    console.log(`\n[Result] Status: ${response.status}`);
    console.log(`[Result] Body: ${response.body}`);

    if (response.status === 200) {
      console.log('SUCCESS: Content received after autonomous payment.');
    } else {
      console.error('FAILURE: Content not received.');
    }

  } catch (e: any) {
    console.error(`\n[Error] Transaction Failed: ${e.message}`);
  }
}

runDemo().catch(console.error);
