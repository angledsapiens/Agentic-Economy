"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EAS_CONTRACT_ADDRESS_MAINNET = exports.EAS_CONTRACT_ADDRESS_SEPOLIA = exports.CIRCLE_API_URL_PROD = exports.CIRCLE_API_URL_SANDBOX = exports.CIRCLE_API_KEY = exports.LIS_MODE = exports.EXAMPLE_PROVIDER_DID = exports.EXAMPLE_BUYER_ADDRESS = exports.EXAMPLE_SELLER_PRIVATE_KEY = exports.DEFAULT_CHAIN_ID = exports.VERIFYING_CONTRACT_ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.VERIFYING_CONTRACT_ADDRESS = process.env.VERIFYING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
exports.DEFAULT_CHAIN_ID = parseInt(process.env.DEFAULT_CHAIN_ID || '1', 10);
// For testing/examples only
exports.EXAMPLE_SELLER_PRIVATE_KEY = process.env.SELLER_PRIVATE_KEY || '0x0123456789012345678901234567890123456789012345678901234567890123';
exports.EXAMPLE_BUYER_ADDRESS = process.env.BUYER_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Hardhat Account #1
exports.EXAMPLE_PROVIDER_DID = process.env.PROVIDER_DID || 'did:pkh:eip155:1:0x123...';
// Production / Live Mode Config
// Production / Live Mode Config
exports.LIS_MODE = process.env.LIS_MODE || 'LOCAL';
exports.CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || ''; // Must be provided in .env
exports.CIRCLE_API_URL_SANDBOX = 'https://api-sandbox.circle.com/v1';
exports.CIRCLE_API_URL_PROD = 'https://api.circle.com/v1';
exports.EAS_CONTRACT_ADDRESS_SEPOLIA = "0x4200000000000000000000000000000000000021";
exports.EAS_CONTRACT_ADDRESS_MAINNET = "0x4200000000000000000000000000000000000021"; // Check for Mainnet address validity later
