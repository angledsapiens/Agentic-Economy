"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC_ASSET = exports.NATIVE_ASSET = void 0;
exports.NATIVE_ASSET = {
    type: 'NATIVE',
    chainId: 1, // Default to Mainnet, should be overridden
    decimals: 18,
    symbol: 'ETH'
};
exports.USDC_ASSET = {
    type: 'ERC20',
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC'
};
