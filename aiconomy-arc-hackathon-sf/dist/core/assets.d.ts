export type AssetType = 'NATIVE' | 'ERC20';
export interface AssetProfile {
    type: AssetType;
    chainId: number;
    address?: string;
    decimals: number;
    symbol: string;
}
export declare const NATIVE_ASSET: AssetProfile;
export declare const USDC_ASSET: AssetProfile;
