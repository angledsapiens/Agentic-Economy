import { Pool, PoolClient } from 'pg';

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

export class TransactionStore {
  private pool: Pool;

  constructor(connectionString?: string) {
    const connStr = connectionString || process.env.DATABASE_URL;

    if (!connStr) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.pool = new Pool({
      connectionString: connStr,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('[TransactionStore] PostgreSQL pool initialized');
    this.initializeSchema();
  }

  private async initializeSchema(): Promise<void> {
    try {
      const client = await this.pool.connect();

      // Create tables if they don't exist (idempotent)
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          tx_hash VARCHAR(66) UNIQUE NOT NULL,
          block_number BIGINT,
          from_address VARCHAR(42) NOT NULL,
          to_address VARCHAR(42) NOT NULL,
          amount VARCHAR(78) NOT NULL,
          gas_used VARCHAR(78),
          status VARCHAR(20) NOT NULL CHECK (status IN ('CONFIRMED', 'FAILED', 'PENDING')),
          network VARCHAR(50) DEFAULT 'ARC Testnet',
          chain_id INTEGER DEFAULT 5042002,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_tx_hash ON transactions(tx_hash);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp DESC);

        CREATE TABLE IF NOT EXISTS balance_snapshots (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) NOT NULL,
          balance VARCHAR(78) NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_wallet_address ON balance_snapshots(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_snapshot_timestamp ON balance_snapshots(timestamp DESC);
      `);

      client.release();
      console.log('[TransactionStore] Schema initialized successfully');
    } catch (error: any) {
      console.error('[TransactionStore] Schema initialization failed:', error.message);
      throw error;
    }
  }

  async recordTransaction(tx: Transaction): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO transactions (
          tx_hash, block_number, from_address, to_address,
          amount, gas_used, status, network, chain_id, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (tx_hash) DO NOTHING
      `, [
        tx.txHash,
        tx.blockNumber,
        tx.fromAddress,
        tx.toAddress,
        tx.amount,
        tx.gasUsed || null,
        tx.status,
        tx.network || 'ARC Testnet',
        tx.chainId || 5042002,
        tx.timestamp || new Date()
      ]);

      console.log(`[TransactionStore] Recorded tx: ${tx.txHash}`);
    } catch (error: any) {
      console.error(`[TransactionStore] Failed to record transaction:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async recordBalanceSnapshot(walletAddress: string, balance: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO balance_snapshots (wallet_address, balance)
        VALUES ($1, $2)
      `, [walletAddress, balance]);

      console.log(`[TransactionStore] Recorded balance snapshot: ${balance} wei`);
    } catch (error: any) {
      console.error(`[TransactionStore] Failed to record balance snapshot:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllTransactions(limit = 100): Promise<Transaction[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        SELECT * FROM transactions
        ORDER BY timestamp DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        txHash: row.tx_hash,
        blockNumber: parseInt(row.block_number),
        fromAddress: row.from_address,
        toAddress: row.to_address,
        amount: row.amount,
        gasUsed: row.gas_used,
        status: row.status,
        network: row.network,
        chainId: row.chain_id,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error: any) {
      console.error(`[TransactionStore] Failed to fetch transactions:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async getLatestBalance(): Promise<string | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        SELECT balance FROM balance_snapshots
        ORDER BY timestamp DESC
        LIMIT 1
      `);

      return result.rows.length > 0 ? result.rows[0].balance : null;
    } catch (error: any) {
      console.error(`[TransactionStore] Failed to fetch latest balance:`, error.message);
      return null;
    } finally {
      client.release();
    }
  }

  async getTransactionCount(): Promise<number> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`SELECT COUNT(*) as count FROM transactions`);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('[TransactionStore] PostgreSQL pool closed');
  }
}
