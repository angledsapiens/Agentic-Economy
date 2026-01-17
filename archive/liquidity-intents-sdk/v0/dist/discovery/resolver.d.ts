export declare class CapabilityResolver {
    private contractResolver?;
    private localRegistry;
    constructor(rpcUrl?: string, registryAddress?: string);
    findAgents(requiredCapability: string, minReputation?: number): Promise<string[]>;
}
