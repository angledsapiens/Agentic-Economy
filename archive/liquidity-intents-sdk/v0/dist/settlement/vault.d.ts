export declare class Vault {
    deposit(amount: string, assetAddress: string): Promise<string>;
    withdraw(amount: string, assetAddress: string, recipient: string): Promise<string>;
}
