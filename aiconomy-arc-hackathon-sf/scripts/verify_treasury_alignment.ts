import dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { SettlementEngine } from '../src/settlement/engine';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function verifyTreasuryAlignment() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Treasury Alignment Verification');
  console.log('═══════════════════════════════════════════════\n');

  const mode = process.env.LIS_MODE;
  if (mode !== 'TESTNET') {
    console.log(`⚠️  Skipping verification - LIS_MODE is ${mode}, not TESTNET`);
    return;
  }

  // 1. Fetch on-chain balance directly
  const rpcUrl = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  const usdcAddress = process.env.ARC_USDC_CONTRACT!;
  const privateKey = process.env.SELLER_PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ SELLER_PRIVATE_KEY not set');
    process.exit(1);
  }

  const walletAddress = new ethers.Wallet(privateKey).address;

  console.log(`Wallet: ${walletAddress}`);
  console.log(`USDC Contract: ${usdcAddress}`);
  console.log(`RPC: ${rpcUrl}\n`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);

  const onChainBalance = await usdcContract.balanceOf(walletAddress);
  console.log(`✅ On-Chain Balance: ${onChainBalance.toString()} wei`);
  console.log(`   (${(Number(onChainBalance) / 1_000_000).toFixed(6)} USDC)\n`);

  // 2. Fetch Treasury snapshot
  const settlement = new SettlementEngine();

  // Give Treasury a moment to initialize from chain
  await new Promise(resolve => setTimeout(resolve, 2000));

  const treasurySnapshot = await settlement.getBalance('USDC');

  console.log(`✅ Treasury Snapshot:`);
  console.log(`   Total: ${treasurySnapshot.totalBalance} wei`);
  console.log(`   Reserved: ${treasurySnapshot.reservedBalance} wei`);
  console.log(`   Available: ${treasurySnapshot.availableBalance} wei\n`);

  // 3. Compare with tolerance for gas
  const onChainBig = BigInt(onChainBalance.toString());
  const treasuryBig = BigInt(treasurySnapshot.totalBalance);
  const delta = onChainBig > treasuryBig ? onChainBig - treasuryBig : treasuryBig - onChainBig;

  // Allow up to 1 USDC difference (for gas from recent txs)
  const tolerance = 1_000_000n; // 1 USDC in wei

  console.log(`Delta: ${delta.toString()} wei`);

  if (delta <= tolerance) {
    console.log(`✅ ALIGNED - Delta within tolerance (${tolerance.toString()} wei)\n`);
  } else {
    console.log(`⚠️  MISALIGNED - Delta exceeds tolerance\n`);
    console.log(`   This may indicate:`);
    console.log(`   - Recent transaction gas not yet reflected`);
    console.log(`   - Treasury cache staleness`);
    console.log(`   - Network synchronization delay\n`);
  }

  // 4. ArcScan reference
  console.log(`ArcScan Links:`);
  console.log(`  Wallet: https://testnet.arcscan.app/address/${walletAddress}`);
  console.log(`  USDC Contract: https://testnet.arcscan.app/address/${usdcAddress}\n`);

  console.log('═══════════════════════════════════════════════');

  process.exit(0);
}

verifyTreasuryAlignment().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
