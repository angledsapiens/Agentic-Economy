import { CommerceProfile } from '../../core/profile';
import { AgentDescriptor } from './types';
import { ERC8004Registry } from './registry';
/**
 * ERC-8004 Adapter
 *
 * Bridges the internal `CommerceProfile` with the external `AgentDescriptor` standard.
 */
export declare class ERC8004Adapter {
    private registry;
    constructor(registry: ERC8004Registry);
    /**
     * Converts a CommerceProfile to an ERC-8004 compliant AgentDescriptor.
     */
    toDescriptor(profile: CommerceProfile): AgentDescriptor;
    /**
     * Publishes the agent's profile to the blockchain registry.
     */
    publish(profile: CommerceProfile): Promise<string>;
    /**
     * Discovers agents that match a specific capability.
     */
    discover(capability: string): Promise<AgentDescriptor[]>;
}
