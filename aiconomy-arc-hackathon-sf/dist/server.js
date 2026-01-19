"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load .env before imports
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const engine_1 = require("./settlement/engine");
const resolver_1 = require("./discovery/resolver");
const interpretation_1 = require("./core/interpretation");
const transaction_store_1 = require("./services/transaction-store");
const log_generator_1 = require("./services/log-generator");
// Mock USDC Asset if not exported
const USDC_ASSET = {
    type: 'ERC20',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    chainId: 8453,
    decimals: 6,
    symbol: 'USDC'
};
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001; // 3001 to avoid conflict with Next.js app on 3000
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize SDK Components
const settlement = new engine_1.SettlementEngine();
const resolver = new resolver_1.CapabilityResolver(process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network', process.env.REGISTRY_ADDRESS // Optional: Set in .env if deployed
);
// Initialize Transaction Logging (Production PostgreSQL)
const txStore = new transaction_store_1.TransactionStore();
const logGenerator = new log_generator_1.LogGenerator(txStore);
// --- Endpoints ---
// 1. Discovery: Get Agents
app.get('/agents', async (req, res) => {
    const capability = req.query.capability || 'LIP_TEXT';
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
    }
    catch (e) {
        res.status(500).json({ error: 'Discovery failed' });
    }
});
// 2. Hire: x402-Protected Commerce Endpoint
// Supports both GET and POST for demo convenience
const handleHireRequest = async (req, res) => {
    const { sellerDid, amount } = req.body || {};
    // Check for x402-proof header (simulated - in production would validate signature/tx hash)
    const x402Proof = req.headers['x402-proof'];
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
    const interpretedIntent = {
        type: interpretation_1.IntentType.BUY,
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
        }
        else {
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
    }
    catch (e) {
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
        const p = path_1.default.resolve(__dirname, '../Policy.json');
        const data = fs_1.default.readFileSync(p, 'utf-8');
        res.json(JSON.parse(data));
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to read policy' });
    }
});
// 4. Config: Write Policy
app.post('/config', (req, res) => {
    try {
        const p = path_1.default.resolve(__dirname, '../Policy.json');
        fs_1.default.writeFileSync(p, JSON.stringify(req.body, null, 2));
        // Reload policy in Fiduciary (requires restart or notify logic, assuming simple restart for now)
        res.json({ success: true });
    }
    catch (e) {
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
const auto_faucet_1 = require("./playground/auto-faucet");
const ethers_1 = require("ethers");
// ... existing code ...
/**
 * 5. Activity Log (Dynamic from Database)
 */
app.get('/api/activity', async (req, res) => {
    try {
        const log = await logGenerator.generateExecutionLog();
        res.json({ logs: log });
    }
    catch (error) {
        console.error('[/api/activity] Error:', error.message);
        res.status(500).json({ error: 'Failed to generate activity log', message: error.message });
    }
});
/**
 * 6. Transaction History (JSON)
 */
app.get('/api/transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const transactions = await txStore.getAllTransactions(limit);
        const stats = await logGenerator.getTransactionStats();
        res.json({
            transactions,
            stats,
            count: transactions.length
        });
    }
    catch (error) {
        console.error('[/api/transactions] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch transactions', message: error.message });
    }
});
/**
 * 7. Treasury Snapshot (Real-Time from Database)
 */
app.get('/api/treasury', async (req, res) => {
    try {
        const latestBalance = await txStore.getLatestBalance();
        const snapshot = await settlement.getBalance('USDC');
        res.json({
            currency: 'USDC',
            totalBalance: snapshot.totalBalance,
            reservedBalance: snapshot.reservedBalance,
            availableBalance: snapshot.availableBalance,
            lastUpdated: new Date().toISOString(),
            source: 'postgresql'
        });
    }
    catch (error) {
        console.error('[/api/treasury] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch treasury data', message: error.message });
    }
});
//  === Server Startup ===
app.listen(PORT, async () => {
    console.log(`LIS Dashboard Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.LIS_MODE || 'LOCAL'}`);
    console.log(`Registry: ${process.env.REGISTRY_ADDRESS}`);
    // CRITICAL: Validate ARC Testnet connection
    if (process.env.LIS_MODE !== 'LOCAL' && process.env.ARC_RPC_URL) {
        const { validateARCNetwork } = await Promise.resolve().then(() => __importStar(require('./config/network-validator')));
        try {
            await validateARCNetwork(process.env.ARC_RPC_URL);
        }
        catch (error) {
            console.error('\n🚨 STARTUP FAILED: Network validation error');
            console.error(error.message);
            process.exit(1);
        }
    }
    // Automated Initialization
    if (process.env.LIS_MODE !== 'LOCAL') {
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ARC_RPC_URL);
        // Assuming single wallet from env or derived
        if (process.env.SELLER_PRIVATE_KEY) {
            const wallet = new ethers_1.ethers.Wallet(process.env.SELLER_PRIVATE_KEY, provider);
            console.log(`[Init] Checking stats for ${wallet.address}...`);
            await auto_faucet_1.AutoFaucet.checkAndFund(wallet.address, provider);
        }
    }
});
