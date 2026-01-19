/**
 * ARC USDC Contract Investigation
 *
 * The address 0x3600000000000000000000000000000000000000 may not be
 * a standard ERC-20 contract. This script investigates the actual interface.
 */

import dotenv from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function investigateUSDC() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ARC USDC Contract Investigation');
  console.log('═══════════════════════════════════════════════════════\n');

  const rpcUrl = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  const usdcAddress = '0x3600000000000000000000000000000000000000';

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log(`Contract Address: ${usdcAddress}`);
  console.log(`Network: ARC Testnet\n`);

  // Check if contract exists
  const code = await provider.getCode(usdcAddress);
  console.log(`Contract Code Length: ${code.length} bytes`);

  if (code === '0x') {
    console.log('⚠️ WARNING: No contract code at this address!');
    console.log('This may be a precompile or special address.\n');
  } else {
    console.log('✅ Contract code exists\n');
  }

  // Try standard ERC-20 interface
  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)'
  ];

  const contract = new ethers.Contract(usdcAddress, erc20Abi, provider);

  try {
    console.log('Querying ERC-20 metadata...');
    const [name, symbol, decimals] = await Promise.all([
      contract.name().catch(() => 'N/A'),
      contract.symbol().catch(() => 'N/A'),
      contract.decimals().catch(() => 'N/A')
    ]);

    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Decimals: ${decimals}\n`);

  } catch (error: any) {
    console.error('❌ Failed to query ERC-20 metadata:', error.message);
  }

  // Check if this is a native token wrapper or precompile
  console.log('\nHypothesis: This may be a native USDC precompile on ARC.');
  console.log('On ARC Testnet, USDC may be used as native gas token.');
  console.log('Standard ERC-20 transfer() may not work.\n');

  console.log('Recommendation:');
  console.log('1. Check ARC documentation for native USDC handling');
  console.log('2. Verify if simple ETH-style transfers work instead');
  console.log('3. Contact ARC team for correct USDC interaction method\n');

  // Try getting balance with simpler call
  try {
    const wallet = new ethers.Wallet(process.env.SELLER_PRIVATE_KEY!, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Native Balance (ETH-style call): ${ethers.formatEther(balance)} (ETH units)`);
    console.log('This may be USDC if ARC uses USDC as gas token.\n');
  } catch (error: any) {
    console.error('Error fetching balance:', error.message);
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

investigateUSDC().catch(console.error);
