"use strict";
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
// Mock USDC Asset if not exported
const USDC_ASSET = {
    type: 'ERC20',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    chainId: 8453,
    decimals: 6,
    symbol: 'USDC'
};
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize SDK Components
const settlement = new engine_1.SettlementEngine();
const resolver = new resolver_1.CapabilityResolver(process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org', process.env.REGISTRY_ADDRESS // Optional: Set in .env if deployed
);
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
// 2. Hire: Trigger Settlement
app.post('/hire', async (req, res) => {
    const { sellerDid, amount } = req.body;
    console.log(`[Server] Hiring ${sellerDid} for ${amount} units...`);
    // Create Interpreted Intent (Mocking the Interpreter step)
    const interpretedIntent = {
        type: interpretation_1.IntentType.BUY,
        counterparty: sellerDid.replace('did:pkh:', ''),
        reasoning: 'Direct Hire via Dashboard',
        subject: {
            name: 'LIP_TEXT_GEN',
            description: 'Human-initiated service request'
        },
        settlement: {
            asset: 'USDC',
            amount: amount || '1000000'
        },
        metadata: {
            templateType: 'BUY_SERVICE',
            serviceName: 'Dashboard Service',
            sellerDID: sellerDid,
            maxPrice: amount || '1000000',
            description: 'Manual hire from dashboard'
        }
    };
    const intent = { id: `intent-${Date.now()}` }; // Legacy ID for response
    try {
        const result = await settlement.reserve(interpretedIntent);
        if (result) {
            res.json({ success: true, intentId: intent.id, reservationId: result });
        }
        else {
            res.status(400).json({ success: false, error: 'Settlement Failed' });
        }
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
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
app.listen(PORT, async () => {
    console.log(`LIG Dashboard Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.LIS_MODE || 'LOCAL'}`);
    console.log(`Registry: ${process.env.REGISTRY_ADDRESS}`);
    // Automated Initialization
    if (process.env.LIS_MODE !== 'LOCAL') {
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
        // Assuming single wallet from env or derived
        if (process.env.SELLER_PRIVATE_KEY) {
            const wallet = new ethers_1.ethers.Wallet(process.env.SELLER_PRIVATE_KEY, provider);
            console.log(`[Init] Checking stats for ${wallet.address}...`);
            await auto_faucet_1.AutoFaucet.checkAndFund(wallet.address, provider);
        }
    }
});
