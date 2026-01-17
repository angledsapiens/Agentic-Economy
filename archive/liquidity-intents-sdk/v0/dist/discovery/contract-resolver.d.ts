export declare class ContractResolver {
    private provider;
    private registryAddress;
    constructor(rpcUrl: string, registryAddress: string);
    getAgents(capability: string): Promise<any[]>;
    register(signerPrivateKey: string, capability: string, minPriceWei: string): Promise<string>;
}
