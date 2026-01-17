"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC8004Adapter = void 0;
/**
 * ERC-8004 Adapter
 *
 * Bridges the internal `CommerceProfile` with the external `AgentDescriptor` standard.
 */
class ERC8004Adapter {
    constructor(registry) {
        this.registry = registry;
    }
    /**
     * Converts a CommerceProfile to an ERC-8004 compliant AgentDescriptor.
     */
    toDescriptor(profile) {
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
    async publish(profile) {
        const descriptor = this.toDescriptor(profile);
        const txId = await this.registry.register(descriptor);
        console.log(`[Adapter] Published Agent '${profile.name}' to ERC-8004 Registry. Tx: ${txId}`);
        return txId;
    }
    /**
     * Discovers agents that match a specific capability.
     */
    async discover(capability) {
        return await this.registry.findAgents(capability);
    }
}
exports.ERC8004Adapter = ERC8004Adapter;
