import dotenv from 'dotenv';
dotenv.config();

export const VERIFYING_CONTRACT_ADDRESS = process.env.VERIFYING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const DEFAULT_CHAIN_ID = parseInt(process.env.DEFAULT_CHAIN_ID || '1', 10);

// For testing/examples only
export const EXAMPLE_SELLER_PRIVATE_KEY = process.env.SELLER_PRIVATE_KEY || '0x0123456789012345678901234567890123456789012345678901234567890123';
export const EXAMPLE_BUYER_ADDRESS = process.env.BUYER_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Hardhat Account #1
export const EXAMPLE_PROVIDER_DID = process.env.PROVIDER_DID || 'did:pkh:eip155:1:0x123...';

// Production / Live Mode Config
// Production / Live Mode Config
export const LIS_MODE: 'LOCAL' | 'TESTNET' | 'LIVE' = (process.env.LIS_MODE as 'LOCAL' | 'TESTNET' | 'LIVE') || 'LOCAL';
export const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || ''; // Must be provided in .env
export const CIRCLE_API_URL_SANDBOX = 'https://api-sandbox.circle.com/v1';
export const CIRCLE_API_URL_PROD = 'https://api.circle.com/v1';
export const EAS_CONTRACT_ADDRESS_SEPOLIA = "0x4200000000000000000000000000000000000021";
export const EAS_CONTRACT_ADDRESS_MAINNET = "0x4200000000000000000000000000000000000021"; // Check for Mainnet address validity later
