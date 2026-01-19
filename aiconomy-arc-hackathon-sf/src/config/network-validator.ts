import { ethers } from 'ethers';

const ARC_TESTNET_CHAIN_ID = 5042002;

/**
 * Validates that the connected network is ARC Testnet.
 * HARD FAILS if any other chain is detected.
 */
export async function validateARCNetwork(rpcUrl: string): Promise<void> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== ARC_TESTNET_CHAIN_ID) {
      console.error(`❌ CRITICAL: Connected to wrong network!`);
      console.error(`   Expected: ARC Testnet (${ARC_TESTNET_CHAIN_ID})`);
      console.error(`   Detected: Chain ID ${chainId}`);
      console.error(`   RPC: ${rpcUrl}`);
      throw new Error(`Network mismatch: Expected ARC Testnet (${ARC_TESTNET_CHAIN_ID}), got Chain ID ${chainId}`);
    }

    console.log(`✅ Connected to ARC Testnet (${ARC_TESTNET_CHAIN_ID})`);
    console.log(`   RPC: ${rpcUrl}`);
  } catch (error: any) {
    if (error.message.includes('Network mismatch')) {
      throw error; // Re-throw network mismatch errors
    }
    console.error(`❌ CRITICAL: Failed to connect to network`);
    console.error(`   RPC: ${rpcUrl}`);
    console.error(`   Error: ${error.message}`);
    throw new Error(`Network connection failed: ${error.message}`);
  }
}
