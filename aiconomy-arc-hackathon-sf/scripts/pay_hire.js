const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const rpc = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  const key = process.env.SELLER_PRIVATE_KEY;
  const usdcAddr = process.env.ARC_USDC_CONTRACT || '0x3600000000000000000000000000000000000000';

  if (!key) throw new Error("Missing SELLER_PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  // Minimal ERC20 ABI
  const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
  const usdc = new ethers.Contract(usdcAddr, abi, wallet);

  console.log(`Sending 0.1 USDC from ${wallet.address} to self...`);

  // Send 0.1 USDC to self (100000 wei)
  const tx = await usdc.transfer(wallet.address, 100000n);
  console.log(`Tx sent: ${tx.hash}`);

  console.log(`Waiting for confirmation...`);
  await tx.wait(1);
  console.log(`Confirmed.`);

  // Only output the hash on the last line for easy parsing
  console.log(tx.hash);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
