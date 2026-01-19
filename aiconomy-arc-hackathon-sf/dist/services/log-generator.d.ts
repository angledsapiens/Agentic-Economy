import { TransactionStore } from './transaction-store';
export declare class LogGenerator {
    private txStore;
    constructor(txStore: TransactionStore);
    generateExecutionLog(): Promise<string>;
    private buildMarkdown;
    getTransactionStats(): Promise<{
        totalTransactions: number;
        confirmedTransactions: number;
        totalVolume: string;
        totalGasCost: string;
    }>;
}
