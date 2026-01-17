/**
 * Commerce Profile Schema
 * Defines the identity and governing policy for an autonomous agent.
 */

export enum ProfileStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

export interface CommercePolicy {
  id: string; // Unique Policy Hash/ID
  name: string;
  version: string;

  /** Maximum amount allowed for a single transaction (in integer units, e.g. USDC wei) */
  globalLimit: string;

  /** Maximum total spend allowed within a 24-hour window */
  dailyLimit: string;

  /** Transactions below this amount are approved automatically */
  autoApproveBelow: string;

  /** If true, ALL transactions require manual approval regardless of amount */
  requireApproval: boolean;

  /** Minimum reputation score required for a counterparty (0-100) */
  minReputation: number;
}

export interface CommerceProfile {
  id: string;          // Unique Identifier (DID or UUID)
  name: string;        // Human-readable name

  // Identity
  address: string;     // EVM Wallet Address
  controlledBy: string; // Controller DID (User or Master Agent)

  // Status
  status: ProfileStatus;

  // Capabilities
  capabilities: string[]; // List of supported intents (e.g. 'LIP_TEXT', 'LIP_ASSET')

  // Governance
  activePolicyId: string; // Reference to a stored Policy ID

  createdAt: number;   // Timestamp
  updatedAt: number;   // Timestamp
}

export const DEFAULT_POLICY: CommercePolicy = {
  id: 'policy-default-000',
  name: 'Default Safe Policy',
  version: '1.0.0',
  globalLimit: '0',
  dailyLimit: '0',
  autoApproveBelow: '0',
  requireApproval: true,
  minReputation: 0
};
