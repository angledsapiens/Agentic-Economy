import { ethers } from 'ethers';
export declare class PaymasterService {
    private paymasterUrl;
    constructor(paymasterUrl?: string);
    shouldSponsor(address: string, provider: ethers.Provider): Promise<boolean>;
    getPaymasterAndData(userOp: any): Promise<string>;
    wrapTransaction(tx: ethers.TransactionRequest): Promise<any>;
}
