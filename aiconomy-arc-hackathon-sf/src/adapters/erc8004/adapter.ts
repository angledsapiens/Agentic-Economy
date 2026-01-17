import { CommerceProfile } from '../../core/profile';
import { AgentDescriptor } from './types';
import { ERC8004Registry } from './registry';

/**
 * ERC-8004 Adapter
 *
 * Bridges the internal `CommerceProfile` with the external `AgentDescriptor` standard.
 */
export class ERC8004Adapter {
  private registry: ERC8004Registry;

  constructor(registry: ERC8004Registry) {
    this.registry = registry;
  }

  /**
   * Converts a CommerceProfile to an ERC-8004 compliant AgentDescriptor.
   */
  toDescriptor(profile: CommerceProfile): AgentDescriptor {
    return {
      name: profile.name,
      description: `Agent managed by ${profile.controlledBy}`,
      capabilities: profile.capabilities,
      paymentAddress: profile.address,
      version: profile.activePolicyId.split('-').pop() || '1.0.0'
    };
  }

  /**
   * Publishes the agent's profile to the blockchain registry.
   */
  async publish(profile: CommerceProfile): Promise<string> {
    const descriptor = this.toDescriptor(profile);
    const txId = await this.registry.register(descriptor);
    console.log(`[Adapter] Published Agent '${profile.name}' to ERC-8004 Registry. Tx: ${txId}`);
    return txId;
  }

  /**
   * Discovers agents that match a specific capability.
   */
  async discover(capability: string): Promise<AgentDescriptor[]> {
    return await this.registry.findAgents(capability);
  }
}
