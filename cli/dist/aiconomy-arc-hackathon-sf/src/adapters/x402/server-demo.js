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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const middleware_1 = require("./middleware");
const engine_1 = require("../../settlement/engine");
const profile_1 = require("../../core/profile");
const dotenv = __importStar(require("dotenv"));
const types_1 = require("./types");
// Load ENV
dotenv.config();
/**
 * x402 End-to-End Demo (Sprint 5B: Clarity Pass)
 *
 * Simulates a Buyer (Client) paying a Seller (Server) for generated text.
 * Demonstrates:
 * 1. 402 Payment Required Challenge
 * 2. On-Chain Settlement (Simulated/Live)
 * 3. x402-proof Header Authorization
 */
async function runDemo() {
    console.log('--- Starting x402 Micropayment Demo ---');
    // --- 1. SETUP SELLER (Server) ---
    const sellerDID = 'did:pkh:seller-address';
    const server = new middleware_1.X402Server(sellerDID);
    // Set Price: 1 USDC for Text Gen
    server.setPrice('/gen-text', '1000000');
    // --- 2. SETUP BUYER (Client) ---
    const buyerProfile = {
        id: 'did:pkh:buyer',
        name: 'Autonomous Agent',
        address: '0xBuyerAddress',
        controlledBy: 'user',
        status: profile_1.ProfileStatus.ACTIVE,
        capabilities: [],
        activePolicyId: 'policy-default-000',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    const settlement = new engine_1.SettlementEngine();
    // Create Client with injected "fetch" that calls our mock server
    const client = new client_1.X402Client(buyerProfile, profile_1.DEFAULT_POLICY, settlement, async (url, options) => {
        // Simulate Network Latency
        await new Promise(resolve => setTimeout(resolve, 50));
        const path = '/' + url.split('/').pop();
        // Log outbound headers for visibility
        const auth = options.headers?.[types_1.HEADER_AUTHORIZATION];
        if (auth) {
            console.log(`[Network] Outbound Request: ${url} | Auth: ${auth}`);
        }
        else {
            console.log(`[Network] Outbound Request: ${url} | No Auth`);
        }
        // Call Server Middleware
        return await server.handleRequest(path, options.headers || {});
    });
    // --- 3. EXECUTE TRANSACTION ---
    console.log('\n[Action] Agent requesting /gen-text resource...');
    try {
        const response = await client.fetch('http://api.service/gen-text');
        console.log(`\n[Result] Status: ${response.status}`);
        console.log(`[Result] Body: ${response.body}`);
        if (response.status === 200) {
            console.log('SUCCESS: Content received after autonomous payment.');
        }
        else {
            console.error('FAILURE: Content not received.');
        }
    }
    catch (e) {
        console.error(`\n[Error] Transaction Failed: ${e.message}`);
    }
}
runDemo().catch(console.error);
