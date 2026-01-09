import pkg from '@agentic-economy/liquidity-intents-sdk-v0';
// @ts-ignore
const { ContractResolver } = pkg;
import type { ContractResolver as ContractResolverType } from '@agentic-economy/liquidity-intents-sdk-v0';

export interface TargetAgent {
  address: string;
  capability: string;
  score: number;
}

export class Scout {
  private resolver: ContractResolverType;

  constructor(rpcUrl: string, registryAddress: string) {
    // Instantiate the SDK Resolver
    // @ts-ignore
    this.resolver = new ContractResolver(rpcUrl, registryAddress);
  }

  /**
   * Scans for agents with specific capabilities (e.g. "CLANKER_BOT")
   */
  async scanForTargets(capability: string = "LIP_CHAOS_TEST"): Promise<TargetAgent[]> {
    console.log(`[Scout] Scanning for agents with capability: ${capability}...`);

    try {
      const agents = await this.resolver.getAgents(capability);

      return agents.map((agent: any) => ({
        address: agent.walletAddress || agent.address, // Handle dynamic return shape
        capability: agent.capability,
        score: this.calculateThreatScore(agent)
      }));
    } catch (error) {
      console.error("[Scout] Scan failed:", error);
      return [];
    }
  }

  /**
   * Dummy logic to score an agent based on on-chain data
   */
  private calculateThreatScore(agent: any): number {
    // High price = High Threat (Greedy Clanker)
    if (agent.minPrice && BigInt(agent.minPrice) > BigInt(1000000)) { // > 1 USDC
      return 80;
    }
    return 20;
  }
}
