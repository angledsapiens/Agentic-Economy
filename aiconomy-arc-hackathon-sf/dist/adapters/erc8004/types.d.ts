/**
 * ERC-8004 Agent Descriptor
 *
 * Represents the on-chain metadata for an agent as defined by the ERC-8004 Service Manager standard.
 */
export interface AgentDescriptor {
    name: string;
    description: string;
    capabilities: string[];
    paymentAddress: string;
    rpcEndpoint?: string;
    version?: string;
}
