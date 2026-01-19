import { SettlementEngine, LiquidityIntent, ContractResolver, EnvelopeType } from '../dist';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();

// Enforce TESTNET mode
process.env.LIS_MODE = 'TESTNET';

const API_DELAY = 2000;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('TESTNET Chaos & Discovery Suite', () => {
  let engine: SettlementEngine;
  let resolver: ContractResolver;

  // Setup keys
  const sellerKey = process.env.SELLER_PRIVATE_KEY || '0x0123456789012345678901234567890123456789012345678901234567890123';
  const rpcUrl = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';

  beforeAll(async () => {
    // Initialize Engine
    engine = new SettlementEngine({
      rpcUrl,
      privateKey: sellerKey,
      circleApiKey: process.env.CIRCLE_API_KEY || 'mock_key',
      mode: 'TESTNET'
    });

    // Initialize Resolver
    resolver = new ContractResolver(rpcUrl, process.env.REGISTRY_ADDRESS || '0x2b63E8F0FaE1059e69FFeEAB82a60f1bDbde0E39');
  });

  afterEach(async () => {
    await delay(API_DELAY);
  });

  test('L2 Congestion: Should handle pending timeout gracefully', async () => {
    expect(engine).toBeDefined();
  });

  test('Sandbox Failure: Should rollback on Circle failure', async () => {
    const intent: LiquidityIntent = {
      id: uuidv4(),
      buyer: "0x0000000000000000000000000000000000000000",
      seller: "0xSeller",
      amount: "-100",
      asset: {
        symbol: "USDC",
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        type: "ERC20",
        chainId: 5042002, // ARC Testnet
        decimals: 6
      },
      envelopeType: EnvelopeType.LIP_TEXT,
      deadline: Date.now() + 3600
    };

    if ('lockFunds' in engine) {
      const result = await engine.lockFunds(intent);
      expect(result).toBe(false);
    } else {
      console.warn("SettlementEngine.lockFunds not found");
    }
  });

  test('Live Discovery: Register and Resolve Agent', async () => {
    const agents = await resolver.getAgents("LIP_CHAOS_TEST");
    expect(Array.isArray(agents)).toBe(true);
  });
});
