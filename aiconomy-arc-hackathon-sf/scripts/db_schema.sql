-- LIS Transaction Logging Database Schema
-- PostgreSQL 14+
-- Created: 2026-01-19

-- Create database (run this separately if needed)
-- CREATE DATABASE lis_transactions;

-- Connect to lis_transactions database before running below

-- Transactions table
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
CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);

-- Balance snapshots table
CREATE TABLE IF NOT EXISTS balance_snapshots (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  balance VARCHAR(78) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_address ON balance_snapshots(wallet_address);
CREATE INDEX IF NOT EXISTS idx_snapshot_timestamp ON balance_snapshots(timestamp DESC);

-- Execution events table (for future use)
CREATE TABLE IF NOT EXISTS execution_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_type ON execution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_timestamp ON execution_events(timestamp DESC);

-- Comments
COMMENT ON TABLE transactions IS 'Stores all settlement transactions executed on ARC Testnet';
COMMENT ON TABLE balance_snapshots IS 'Historical wallet balance snapshots for Treasury tracking';
COMMENT ON TABLE execution_events IS 'General execution events and system logs';

-- Grant permissions (adjust user as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
