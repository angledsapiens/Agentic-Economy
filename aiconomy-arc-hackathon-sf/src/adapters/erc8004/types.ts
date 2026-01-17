/**
 * ERC-8004 Agent Descriptor
 *
 * Represents the on-chain metadata for an agent as defined by the ERC-8004 Service Manager standard.
 */
export interface AgentDescriptor {
  name: string;
  description: string;

  // List of capability tags (e.g. "LIP_TEXT_GEN", "LIP_LIQUIDITY")
  capabilities: string[];

  // The address receiving payments (Settlement Address)
  paymentAddress: string;

  // Optional off-chain endpoint for negotiation/RPC
  rpcEndpoint?: string;

  // Optional semantic version
  version?: string;
}
