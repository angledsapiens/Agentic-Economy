/**
 * Commerce Profile Schema
 * Defines the identity and governing policy for an autonomous agent.
 */
export declare enum ProfileStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    SUSPENDED = "SUSPENDED",
    DECOMMISSIONED = "DECOMMISSIONED"
}
export interface CommercePolicy {
    id: string;
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
    id: string;
    name: string;
    address: string;
    controlledBy: string;
    status: ProfileStatus;
    capabilities: string[];
    activePolicyId: string;
    createdAt: number;
    updatedAt: number;
}
export declare const DEFAULT_POLICY: CommercePolicy;
