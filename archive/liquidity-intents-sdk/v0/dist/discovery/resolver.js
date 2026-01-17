"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityResolver = void 0;
const contract_resolver_1 = require("./contract-resolver");
class CapabilityResolver {
    constructor(rpcUrl, registryAddress) {
        this.localRegistry = [
            { did: 'did:pkh:0x123...', capabilities: ['LIP_TEXT', 'LIP_JSON'], reputation: 90 },
            { did: 'did:pkh:0x456...', capabilities: ['LIP_URL'], reputation: 75 },
            { did: 'did:pkh:0x789...', capabilities: ['LIP_BOOLEAN'], reputation: 50 },
        ];
        console.log(`[Resolver] Init: RPC=${rpcUrl ? 'Set' : 'Unset'}, Reg=${registryAddress}`);
        if (rpcUrl && registryAddress) {
            this.contractResolver = new contract_resolver_1.ContractResolver(rpcUrl, registryAddress);
        }
        else {
            console.warn("[Resolver] Contract resolution disabled due to missing config");
        }
    }
    async findAgents(requiredCapability, minReputation = 0) {
        // 1. Get Local Agents
        const localAgents = this.localRegistry
            .filter(agent => agent.capabilities.includes(requiredCapability) &&
            agent.reputation >= minReputation)
            .map(agent => agent.did);
        // 2. Get Contract Agents (if configured)
        let contractAgents = [];
        if (this.contractResolver) {
            console.log(`[Discovery] Querying Registry for ${requiredCapability}...`);
            const results = await this.contractResolver.getAgents(requiredCapability);
            contractAgents = results.map(a => `did:pkh:${a.walletAddress}`);
        }
        // Merge and Deduplicate
        return Array.from(new Set([...localAgents, ...contractAgents]));
    }
}
exports.CapabilityResolver = CapabilityResolver;
