export type AssetType = 'NATIVE' | 'ERC20';

export interface AssetProfile {
  type: AssetType;
  chainId: number;
  address?: string; // Optional for NATIVE
  decimals: number;
  symbol: string;
}

export const NATIVE_ASSET: AssetProfile = {
  type: 'NATIVE',
  chainId: 1, // Default to Mainnet, should be overridden
  decimals: 18,
  symbol: 'ETH'
};

export const USDC_ASSET: AssetProfile = {
  type: 'ERC20',
  chainId: 1,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  symbol: 'USDC'
};
