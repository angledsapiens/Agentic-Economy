export interface Transaction {
    txHash: string;
    blockNumber: number;
    fromAddress: string;
    toAddress: string;
    amount: string;
    gasUsed?: string;
    status: 'CONFIRMED' | 'FAILED' | 'PENDING';
    network?: string;
    chainId?: number;
    timestamp?: Date;
}
export interface BalanceSnapshot {
    walletAddress: string;
    balance: string;
    timestamp: Date;
}
export declare class TransactionStore {
    private pool;
    constructor(connectionString?: string);
    private initializeSchema;
    recordTransaction(tx: Transaction): Promise<void>;
    recordBalanceSnapshot(walletAddress: string, balance: string): Promise<void>;
    getAllTransactions(limit?: number): Promise<Transaction[]>;
    getLatestBalance(): Promise<string | null>;
    getTransactionCount(): Promise<number>;
    close(): Promise<void>;
}
