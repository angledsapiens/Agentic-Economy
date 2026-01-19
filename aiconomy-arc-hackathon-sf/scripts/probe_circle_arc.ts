/**
 * Circle-on-ARC Compatibility Probe
 *
 * Empirical test to determine if Circle supports ARC Testnet (5042002)
 * for real USDC transactions.
 */

import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;
const CIRCLE_SANDBOX_BASE = 'https://api-sandbox.circle.com';

interface CircleChain {
  id: string;
  name: string;
  blockchain: string;
  nativeAsset?: string;
}

async function probeCircleSupport() {
  console.log('═══════════════════════════════════════════');
  console.log('  Circle-on-ARC Compatibility Probe');
  console.log('  Target: ARC Testnet (Chain ID 5042002)');
  console.log('═══════════════════════════════════════════\n');

  if (!CIRCLE_API_KEY) {
    console.error('❌ CIRCLE_API_KEY not found in .env');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json'
  };

  // STEP A: Chain Support Discovery
  console.log('STEP A: Querying supported blockchains...\n');

  try {
    // Try to get configuration/supported chains
    const configResponse = await axios.get(`${CIRCLE_SANDBOX_BASE}/v1/configuration`, { headers });

    console.log('Circle Configuration Response:');
    console.log(JSON.stringify(configResponse.data, null, 2));
    console.log('\n');

  } catch (error: any) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.statusText);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Request Error:', error.message);
    }
  }

  // Try alternative endpoint for supported chains
  try {
    const chainsResponse = await axios.get(`${CIRCLE_SANDBOX_BASE}/v1/businessAccount/wallets/chains`, { headers });

    console.log('Supported Chains:');
    console.log(JSON.stringify(chainsResponse.data, null, 2));

    const chains = chainsResponse.data.data || [];
    const arcChain = chains.find((c: CircleChain) =>
      c.id === '5042002' ||
      c.name?.toLowerCase().includes('arc') ||
      c.blockchain?.toLowerCase().includes('arc')
    );

    if (arcChain) {
      console.log('\n✅ ARC Testnet FOUND in Circle supported chains!');
      console.log('Chain Details:', arcChain);
    } else {
      console.log('\n❌ ARC Testnet NOT FOUND in Circle supported chains');
      console.log('Available chains:', chains.map((c: CircleChain) => `${c.name} (${c.id})`).join(', '));
    }

    console.log('\n');

  } catch (error: any) {
    if (error.response) {
      console.error('Chains API Error:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Request Error:', error.message);
    }
  }

  // STEP B: Transaction Construction Attempt
  console.log('\nSTEP B: Attempting test transaction construction...\n');

  try {
    // First, try to get or create a wallet
    const walletsResponse = await axios.get(`${CIRCLE_SANDBOX_BASE}/v1/wallets`, { headers });
    console.log('Wallets Response:');
    console.log(JSON.stringify(walletsResponse.data, null, 2));

    // Attempt to create a transfer (will likely fail if ARC not supported)
    const transferPayload = {
      source: {
        type: 'wallet',
        id: 'test-wallet-id' // Placeholder
      },
      destination: {
        type: 'blockchain',
        chain: 'ARC-TESTNET', // Try various formats
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
      },
      amount: {
        amount: '0.01',
        currency: 'USD'
      }
    };

    console.log('\nAttempting transfer with payload:');
    console.log(JSON.stringify(transferPayload, null, 2));

    const transferResponse = await axios.post(
      `${CIRCLE_SANDBOX_BASE}/v1/transfers`,
      transferPayload,
      { headers }
    );

    console.log('\n✅ Transfer Response:');
    console.log(JSON.stringify(transferResponse.data, null, 2));

    const txHash = transferResponse.data?.data?.transactionHash;
    if (txHash && txHash.startsWith('0x')) {
      console.log(`\n✅ REAL TX HASH RETURNED: ${txHash}`);
      console.log(`\nSTEP C: Verify at https://testnet.arcscan.app/tx/${txHash}`);
    } else {
      console.log(`\n⚠️ Returned ID (not tx hash): ${txHash || 'N/A'}`);
    }

  } catch (error: any) {
    if (error.response) {
      console.error('\n❌ Transfer API Error:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));

      const errorMsg = error.response.data?.message || error.response.data?.error?.message || '';
      if (errorMsg.toLowerCase().includes('chain') || errorMsg.toLowerCase().includes('network')) {
        console.error('\n🚨 LIKELY: ARC Testnet is NOT supported by Circle');
      }
    } else {
      console.error('Request Error:', error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  Probe Complete');
  console.log('═══════════════════════════════════════════');
}

probeCircleSupport().catch(console.error);
