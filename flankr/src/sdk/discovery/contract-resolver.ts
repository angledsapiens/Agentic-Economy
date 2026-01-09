import { ethers } from 'ethers';
// import { AgentRegistry__factory } from '../playground/typechain-types'; // Placeholder for TypeChain
// For now, we'll inline the ABI for simplicity until compilation is set up
const REGISTRY_ABI = [
  "function registerAgent(string memory _capability, uint256 _minPrice) public",
  "function getAgentsByCapability(string memory _capability) public view returns (tuple(address walletAddress, string capability, uint256 minPrice, uint256 tokenId)[])",
  "event AgentRegistered(address indexed agent, string capability, uint256 minPrice, uint256 tokenId)"
];

export class ContractResolver {
  private provider: ethers.providers.JsonRpcProvider;
  private registryAddress: string;

  constructor(rpcUrl: string, registryAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.registryAddress = registryAddress;
  }

  async getAgents(capability: string): Promise<any[]> {
    const contract = new ethers.Contract(this.registryAddress, REGISTRY_ABI, this.provider);
    try {
      const agents = await contract.getAgentsByCapability(capability);
      return agents.map((a: any) => ({
        walletAddress: a.walletAddress,
        capability: a.capability,
        minPrice: ethers.utils.formatUnits(a.minPrice, "wei"),
        tokenId: a.tokenId.toString()
      }));
    } catch (error) {
      console.error("Failed to resolve agents:", error);
      return [];
    }
  }

  async register(signerPrivateKey: string, capability: string, minPriceWei: string): Promise<string> {
    const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
    const contract = new ethers.Contract(this.registryAddress, REGISTRY_ABI, wallet);

    const tx = await contract.registerAgent(capability, minPriceWei);
    console.log(`Registration tx sent: ${tx.hash}`);
    await tx.wait();
    return tx.hash;
  }
}
