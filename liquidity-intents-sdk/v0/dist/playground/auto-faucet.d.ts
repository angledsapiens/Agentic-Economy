import { ethers } from 'ethers';
export declare class AutoFaucet {
    static drip(address: string, asset?: 'USDC' | 'ETH'): Promise<boolean>;
    static checkAndFund(address: string, provider: ethers.Provider): Promise<void>;
}
