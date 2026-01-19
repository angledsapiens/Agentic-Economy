import { SettlementProvider, SettlementTransferResult } from './provider';
import { ethers } from 'ethers';
import { TransactionStore } from '../services/transaction-store';

/**
 * ARC Settlement Provider
 * Implements direct ERC-20 USDC transfers on ARC Testnet via ethers.js.
 * NO MOCKS. Returns real on-chain transaction hashes only.
 */
export class ARCSettlementProvider implements SettlementProvider {
  readonly name = 'ARC_USDC_NATIVE';

  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private usdcContract: ethers.Contract;
  private txStore: TransactionStore | null = null;

  // ARC Testnet USDC contract address (MUST be deployed on ARC)
  private readonly USDC_ADDRESS = process.env.ARC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000';

  // Standard ERC-20 ABI (only what we need)
  private readonly ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)'
  ];

  constructor(rpcUrl?: string, privateKey?: string) {
    const rpc = rpcUrl || process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
    const key = privateKey || process.env.SELLER_PRIVATE_KEY;

    // DEBUG: Log what we're actually seeing
    console.log(`[ARCProvider DEBUG] privateKey param: ${privateKey ? 'PROVIDED' : 'UNDEFINED'}`);
    console.log(`[ARCProvider DEBUG] process.env.SELLER_PRIVATE_KEY: ${process.env.SELLER_PRIVATE_KEY ? 'SET' : 'UNDEFINED'}`);
    console.log(`[ARCProvider DEBUG] Using key: ${key?.substring(0, 10)}...`);

    if (!key) {
      throw new Error('❌ CRITICAL: SELLER_PRIVATE_KEY required for ARC settlement');
    }

    if (this.USDC_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ WARNING: ARC_USDC_CONTRACT not set in .env. Settlement may fail.');
    }

    this.provider = new ethers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(key, this.provider);
    this.usdcContract = new ethers.Contract(this.USDC_ADDRESS, this.ERC20_ABI, this.wallet);

    console.log(`[ARCProvider] Initialized for ${this.wallet.address} on ARC Testnet`);

    // Initialize transaction store (async - don't block construction)
    this.initializeTransactionStore();
  }

  private async initializeTransactionStore() {
    try {
      this.txStore = new TransactionStore();
      console.log('[ARCProvider] ✅ Transaction logging enabled');
    } catch (error: any) {
      console.warn('[ARCProvider] ⚠️  Transaction store disabled:', error.message);
    }
  }

  async getBalance(asset: string): Promise<string> {
    if (asset !== 'USDC') {
      throw new Error(`Unsupported asset: ${asset}. ARC Provider only supports USDC.`);
    }

    try {
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      console.log(`[ARCProvider] Balance: ${balance.toString()} wei USDC`);
      return balance.toString();
    } catch (error: any) {
      console.error(`[ARCProvider] Failed to fetch balance:`, error.message);
      throw new Error(`Balance fetch failed: ${error.message}`);
    }
  }

  async executeTransfer(
    to: string,
    amount: string,
    asset: string,
    memo?: string
  ): Promise<SettlementTransferResult> {
    console.log(`[ARCProvider] Executing LIVE ARC transfer:`);
    console.log(`  To: ${to}`);
    console.log(`  Amount: ${amount} wei`);
    console.log(`  Asset: ${asset}`);
    console.log(`  Memo: ${memo || 'N/A'}`);

    if (asset !== 'USDC') {
      throw new Error(`Unsupported asset: ${asset}. ARC Provider only supports USDC.`);
    }

    try {
      // Execute ERC-20 transfer
      const tx = await this.usdcContract.transfer(to, BigInt(amount));
      console.log(`[ARCProvider] Transaction broadcast: ${tx.hash}`);
      console.log(`  Waiting for confirmation...`);

      // Wait for 1 confirmation (adjust as needed)
      const receipt = await tx.wait(1);

      if (receipt.status !== 1) {
        console.error(`[ARCProvider] Transaction FAILED on-chain`);
        return {
          transactionId: tx.hash,
          status: 'FAILED'
        };
      }

      console.log(`[ARCProvider] ✅ Transaction CONFIRMED`);
      console.log(`  Tx Hash: ${tx.hash}`);
      console.log(`  Block: ${receipt.blockNumber}`);
      console.log(`  Explorer: https://testnet.arcscan.app/tx/${tx.hash}`);

      // Record transaction in database
      if (this.txStore) {
        try {
          await this.txStore.recordTransaction({
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            fromAddress: this.wallet.address,
            toAddress: to,
            amount: amount,
            gasUsed: receipt.gasUsed.toString(),
            status: 'CONFIRMED',
            network: 'ARC Testnet',
            chainId: 5042002,
            timestamp: new Date()
          });

          // Record balance snapshot
          const newBalance = await this.getBalance('USDC');
          await this.txStore.recordBalanceSnapshot(this.wallet.address, newBalance);

          console.log(`[ARCProvider] ✅ Transaction recorded in database`);
        } catch (dbError: any) {
          console.warn(`[ARCProvider] Failed to record transaction:`, dbError.message);
        }
      }

      return {
        transactionId: tx.hash, // REAL EVM TX HASH
        status: 'COMPLETED',
        fee: receipt.gasUsed ? receipt.gasUsed.toString() : undefined
      };

    } catch (error: any) {
      console.error(`[ARCProvider] Transfer FAILED:`, error.message);

      // Re-throw to ensure no silent failures
      throw new Error(`ARC Settlement Failed: ${error.message}`);
    }
  }

  /**
   * Estimates gas cost for a USDC transfer on ARC Testnet.
   * Returns gas cost in USDC wei (since USDC is native gas token on ARC).
   */
  async estimateGas(to: string, amount: string, asset: string): Promise<string> {
    if (asset !== 'USDC') {
      throw new Error(`Unsupported asset: ${asset}. ARC Provider only supports USDC.`);
    }

    try {
      // Estimate gas for ERC-20 transfer
      const gasEstimate = await this.usdcContract.transfer.estimateGas(to, BigInt(amount));

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;

      // Total gas cost in USDC wei (since USDC is gas token on ARC)
      const gasCost = gasEstimate * gasPrice;

      console.log(`[ARCProvider] Gas Estimate: ${gasEstimate.toString()} units @ ${gasPrice.toString()} wei/unit`);
      console.log(`[ARCProvider] Total Gas Cost: ${gasCost.toString()} wei USDC`);

      return gasCost.toString();
    } catch (error: any) {
      console.warn(`[ARCProvider] Gas estimation failed: ${error.message}`);
      // Fallback to conservative estimate (100k gas * 1 gwei = 100000 wei USDC)
      const fallbackGas = '100000'; // ~0.0001 USDC
      console.warn(`[ARCProvider] Using fallback gas estimate: ${fallbackGas} wei`);
      return fallbackGas;
    }
  }

  /**
   * Cryptographically verifies an x402 payment proof on ARC Testnet.
   * Enforces strict checks: status=1, to=USDC, correct recipient, correct amount.
   */
  async verifyPaymentProof(
    txHash: string,
    requiredAmount: bigint,
    expectedRecipient: string
  ): Promise<boolean> {
    console.log(`[ARCProvider] Verifying x402 proof: ${txHash}`);

    // 1. Structural Validation
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      console.warn(`[ARCProvider] Invalid tx hash format: ${txHash}`);
      return false;
    }

    try {
      // 2. Fetch Transaction & Receipt
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(txHash),
        this.provider.getTransactionReceipt(txHash)
      ]);

      if (!tx || !receipt) {
        console.warn(`[ARCProvider] Tx not found on ARC Testnet`);
        return false;
      }

      // 3. Status Check (Must be confirmed success)
      if (receipt.status !== 1) {
        console.warn(`[ARCProvider] Tx failed (status=${receipt.status})`);
        return false;
      }

      // 4. Interaction Check (Must be with USDC contract)
      if (tx.to?.toLowerCase() !== this.USDC_ADDRESS.toLowerCase()) {
        console.warn(`[ARCProvider] Tx interaction not with USDC contract (to=${tx.to})`);
        return false;
      }

      // 5. Decode Input Data (transfer(to, amount))
      const iface = new ethers.Interface(this.ERC20_ABI);
      const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

      if (decoded?.name !== 'transfer') {
        console.warn(`[ARCProvider] Tx is not a transfer (method=${decoded?.name})`);
        return false;
      }

      const [recipient, amount] = decoded.args;

      // 6. Recipient Check
      if (recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
        console.warn(`[ARCProvider] Wrong recipient: ${recipient} (expected ${expectedRecipient})`);
        return false;
      }

      // 7. Amount Check
      if (amount < requiredAmount) {
        console.warn(`[ARCProvider] Insufficient amount: ${amount} (required ${requiredAmount})`);
        return false;
      }

      console.log(`[ARCProvider] ✅ Payment proof VERIFIED on-chain`);

      // 8. Log to Database (User Requirement for Observer UI visibility)
      if (this.txStore) {
        try {
          await this.txStore.recordTransaction({
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            fromAddress: tx.from,
            toAddress: recipient, // The decoded recipient (us)
            amount: amount.toString(),
            gasUsed: receipt.gasUsed.toString(),
            status: 'CONFIRMED',
            network: 'ARC Testnet',
            chainId: 5042002,
            timestamp: new Date()
          });

          // Update balance snapshot
          const newBalance = await this.getBalance('USDC');
          await this.txStore.recordBalanceSnapshot(this.wallet.address, newBalance);

          console.log(`[ARCProvider] ✅ Verified transaction recorded in DB`);
        } catch (dbError: any) {
          console.warn(`[ARCProvider] Failed to record verified transaction:`, dbError.message);
        }
      }

      return true;

    } catch (error: any) {
      console.error(`[ARCProvider] Verification error: ${error.message}`);
      return false;
    }
  }
}
