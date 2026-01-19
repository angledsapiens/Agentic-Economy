"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARCSettlementProvider = void 0;
const ethers_1 = require("ethers");
const transaction_store_1 = require("../services/transaction-store");
/**
 * ARC Settlement Provider
 * Implements direct ERC-20 USDC transfers on ARC Testnet via ethers.js.
 * NO MOCKS. Returns real on-chain transaction hashes only.
 */
class ARCSettlementProvider {
    constructor(rpcUrl, privateKey) {
        this.name = 'ARC_USDC_NATIVE';
        this.txStore = null;
        // ARC Testnet USDC contract address (MUST be deployed on ARC)
        this.USDC_ADDRESS = process.env.ARC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000';
        // Standard ERC-20 ABI (only what we need)
        this.ERC20_ABI = [
            'function balanceOf(address owner) view returns (uint256)',
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)'
        ];
        const rpc = rpcUrl || process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
        const key = privateKey || process.env.SELLER_PRIVATE_KEY;
        if (!key) {
            throw new Error('❌ CRITICAL: SELLER_PRIVATE_KEY required for ARC settlement');
        }
        if (this.USDC_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('⚠️ WARNING: ARC_USDC_CONTRACT not set in .env. Settlement may fail.');
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpc);
        this.wallet = new ethers_1.ethers.Wallet(key, this.provider);
        this.usdcContract = new ethers_1.ethers.Contract(this.USDC_ADDRESS, this.ERC20_ABI, this.wallet);
        console.log(`[ARCProvider] Initialized for ${this.wallet.address} on ARC Testnet`);
        // Initialize transaction store (async - don't block construction)
        this.initializeTransactionStore();
    }
    async initializeTransactionStore() {
        try {
            this.txStore = new transaction_store_1.TransactionStore();
            console.log('[ARCProvider] ✅ Transaction logging enabled');
        }
        catch (error) {
            console.warn('[ARCProvider] ⚠️  Transaction store disabled:', error.message);
        }
    }
    async getBalance(asset) {
        if (asset !== 'USDC') {
            throw new Error(`Unsupported asset: ${asset}. ARC Provider only supports USDC.`);
        }
        try {
            const balance = await this.usdcContract.balanceOf(this.wallet.address);
            console.log(`[ARCProvider] Balance: ${balance.toString()} wei USDC`);
            return balance.toString();
        }
        catch (error) {
            console.error(`[ARCProvider] Failed to fetch balance:`, error.message);
            throw new Error(`Balance fetch failed: ${error.message}`);
        }
    }
    async executeTransfer(to, amount, asset, memo) {
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
                }
                catch (dbError) {
                    console.warn(`[ARCProvider] Failed to record transaction:`, dbError.message);
                }
            }
            return {
                transactionId: tx.hash, // REAL EVM TX HASH
                status: 'COMPLETED',
                fee: receipt.gasUsed ? receipt.gasUsed.toString() : undefined
            };
        }
        catch (error) {
            console.error(`[ARCProvider] Transfer FAILED:`, error.message);
            // Re-throw to ensure no silent failures
            throw new Error(`ARC Settlement Failed: ${error.message}`);
        }
    }
    /**
     * Estimates gas cost for a USDC transfer on ARC Testnet.
     * Returns gas cost in USDC wei (since USDC is native gas token on ARC).
     */
    async estimateGas(to, amount, asset) {
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
        }
        catch (error) {
            console.warn(`[ARCProvider] Gas estimation failed: ${error.message}`);
            // Fallback to conservative estimate (100k gas * 1 gwei = 100000 wei USDC)
            const fallbackGas = '100000'; // ~0.0001 USDC
            console.warn(`[ARCProvider] Using fallback gas estimate: ${fallbackGas} wei`);
            return fallbackGas;
        }
    }
}
exports.ARCSettlementProvider = ARCSettlementProvider;
