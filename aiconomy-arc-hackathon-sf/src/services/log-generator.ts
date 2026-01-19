import { TransactionStore, Transaction } from './transaction-store';
import { TreasuryManager } from '../treasury/manager';

export class LogGenerator {
  constructor(private txStore: TransactionStore, private treasury?: TreasuryManager) { }

  async generateExecutionLog(): Promise<string> {
    const transactions = await this.txStore.getAllTransactions();

    // Fetch live on-chain balance if TreasuryManager is available
    let latestBalance: string | null = null;
    if (this.treasury) {
      try {
        const snapshot = await this.treasury.getSnapshot('USDC');
        latestBalance = snapshot.totalBalance;
      } catch (error) {
        console.warn('[LogGenerator] Failed to fetch live balance, using database fallback');
        latestBalance = await this.txStore.getLatestBalance();
      }
    } else {
      latestBalance = await this.txStore.getLatestBalance();
    }

    return this.buildMarkdown(transactions, latestBalance);
  }

  private buildMarkdown(transactions: Transaction[], latestBalance: string | null): string {
    const now = new Date();
    const balanceUsdc = latestBalance ? (Number(latestBalance) / 1_000_000).toFixed(6) : '0.000000';
    const balanceWei = latestBalance || '0';

    let md = `# TESTNET Execution Log
**Date**: ${now.toISOString().split('T')[0]}
**Last Updated**: ${now.toISOString()}
**Network**: ARC Testnet (Chain ID 5042002)
**Mode**: TESTNET (ARC-Native Settlement)
**Status**: ✅ LIVE - REAL ON-CHAIN TRANSACTIONS
**Data Source**: Production PostgreSQL Database

## Current Wallet State

**Wallet Address**: \`0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D\`
**Current Balance**: **${balanceUsdc} USDC** (${balanceWei} wei)
**ArcScan**: https://testnet.arcscan.app/address/0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D
**Network**: ARC Testnet (Chain ID 5042002)
**USDC Contract**: 0x3600000000000000000000000000000000000000

---

## Transaction History (${transactions.length} transactions)

`;

    if (transactions.length === 0) {
      md += `No transactions recorded yet.\n\n`;
    } else {
      transactions.forEach((tx, index) => {
        const amountUsdc = (Number(tx.amount) / 1_000_000).toFixed(6);
        const timestamp = tx.timestamp?.toISOString() || 'N/A';

        md += `### Transaction #${transactions.length - index}
- **TX Hash**: \`${tx.txHash}\`
- **Block**: ${tx.blockNumber?.toLocaleString() || 'N/A'}
- **From**: \`${tx.fromAddress.substring(0, 10)}...${tx.fromAddress.substring(38)}\`
- **To**: \`${tx.toAddress.substring(0, 10)}...${tx.toAddress.substring(38)}\`
- **Amount**: ${amountUsdc} USDC (${tx.amount} wei)
- **Gas**: ${tx.gasUsed ? parseInt(tx.gasUsed).toLocaleString() : 'N/A'} units
- **Status**: ${tx.status === 'CONFIRMED' ? '✅ CONFIRMED' : tx.status === 'FAILED' ? '❌ FAILED' : '⏳ PENDING'}
- **Explorer**: https://testnet.arcscan.app/tx/${tx.txHash}
- **Timestamp**: ${timestamp}

`;
      });
    }

    md += `---

## System Information

**Treasury Initialization**: Real-time (on-chain balance fetch at startup)
**Gas Estimation**: Enabled (USDC-as-gas-token on ARC)
**Settlement Provider**: ARCSettlementProvider (Direct EVM transactions)
**Database**: PostgreSQL (Production-ready with automatic logging)

---

**Report Generated**: ${now.toISOString()}
**Auto-Generated**: This log is dynamically generated from the PostgreSQL database.
**All transactions are automatically captured and stored in real-time.**
`;

    return md;
  }

  async getTransactionStats() {
    const transactions = await this.txStore.getAllTransactions();
    const count = await this.txStore.getTransactionCount();

    let totalVolume = 0n;
    let totalGas = 0n;

    for (const tx of transactions) {
      if (tx.status === 'CONFIRMED') {
        totalVolume += BigInt(tx.amount);
        if (tx.gasUsed) {
          totalGas += BigInt(tx.gasUsed);
        }
      }
    }

    return {
      totalTransactions: count,
      confirmedTransactions: transactions.filter(t => t.status === 'CONFIRMED').length,
      totalVolume: (Number(totalVolume) / 1_000_000).toFixed(6) + ' USDC',
      totalGasCost: totalGas.toString() + ' wei'
    };
  }
}
