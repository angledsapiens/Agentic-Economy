import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

async function setupDatabase() {
  console.log('═══════════════════════════════════════════════');
  console.log('  LIS PostgreSQL Database Setup');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Connect to default postgres database first to create lis_transactions
    const rootPool = new Pool({
      connectionString: 'postgresql://postgres:Ashurbanipal1!@13.215.194.63:5432/postgres'
    });

    console.log('[1/4] Connected to PostgreSQL server');

    // Create lis_transactions database if it doesn't exist
    try {
      await rootPool.query('CREATE DATABASE lis_transactions');
      console.log('[2/4] ✅ Created database: lis_transactions');
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log('[2/4] ℹ️   Database lis_transactions already exists');
      } else {
        throw error;
      }
    }

    await rootPool.end();

    // Now connect to lis_transactions database and create schema
    const lisPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    console.log('[3/4] Connected to lis_transactions database');

    // Create tables
    await lisPool.query(`
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

    console.log('[4/4] ✅ Created tables and indexes');

    // Seed historical transactions
    console.log('\n[Seed] Adding historical transactions...');

    const historicalTx = [
      {
        tx_hash: '0x5eaf300c9b6d87477dfd0d23f0e25eaae58dad5c2db3c9f791884b7fc69bd328',
        block_number: 22497591,
        from_address: '0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D',
        to_address: '0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D',
        amount: '500000',
        gas_used: '54550',
        status: 'CONFIRMED',
        timestamp: new Date('2026-01-19T11:50:00Z')
      },
      {
        tx_hash: '0x979288e3e8dd548160b9f8902aef0e144ea0955571c11a03dc335c9f64e7492d',
        block_number: 22499129,
        from_address: '0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D',
        to_address: '0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D',
        amount: '300000',
        gas_used: '54550',
        status: 'CONFIRMED',
        timestamp: new Date('2026-01-19T12:05:00Z')
      }
    ];

    for (const tx of historicalTx) {
      try {
        await lisPool.query(`
          INSERT INTO transactions (
            tx_hash, block_number, from_address, to_address,
            amount, gas_used, status, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (tx_hash) DO NOTHING
        `, [
          tx.tx_hash,
          tx.block_number,
          tx.from_address,
          tx.to_address,
          tx.amount,
          tx.gas_used,
          tx.status,
          tx.timestamp
        ]);
        console.log(`  ✅ Seeded: ${tx.tx_hash.substring(0, 10)}...`);
      } catch (error: any) {
        console.log(`  ℹ️   Already exists: ${tx.tx_hash.substring(0, 10)}...`);
      }
    }

    // Add current balance snapshot
    await lisPool.query(`
      INSERT INTO balance_snapshots (wallet_address, balance)
      VALUES ($1, $2)
    `, ['0x15C99c9A9BF8e52F71b0e7D7CD2DcE82c7b2C86D', '1977463']);

    console.log('  ✅ Recorded current balance snapshot\n');

    await lisPool.end();

    console.log('═══════════════════════════════════════════════');
    console.log('  ✅ Database Setup Complete!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('Connection String:', process.env.DATABASE_URL);
    console.log('\nYou can now start the server with automatic transaction logging.');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupDatabase();
