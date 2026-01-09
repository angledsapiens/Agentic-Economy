"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractResolver = void 0;
const ethers_1 = require("ethers");
// import { AgentRegistry__factory } from '../playground/typechain-types'; // Placeholder for TypeChain
// For now, we'll inline the ABI for simplicity until compilation is set up
const REGISTRY_ABI = [
    "function registerAgent(string memory _capability, uint256 _minPrice) public",
    "function getAgentsByCapability(string memory _capability) public view returns (tuple(address walletAddress, string capability, uint256 minPrice, uint256 tokenId)[])",
    "event AgentRegistered(address indexed agent, string capability, uint256 minPrice, uint256 tokenId)"
];
class ContractResolver {
    constructor(rpcUrl, registryAddress) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.registryAddress = registryAddress;
    }
    async getAgents(capability) {
        const contract = new ethers_1.ethers.Contract(this.registryAddress, REGISTRY_ABI, this.provider);
        try {
            const agents = await contract.getAgentsByCapability(capability);
            return agents.map((a) => ({
                walletAddress: a.walletAddress,
                capability: a.capability,
                minPrice: ethers_1.ethers.formatUnits(a.minPrice, "wei"),
                tokenId: a.tokenId.toString()
            }));
        }
        catch (error) {
            console.error("Failed to resolve agents:", error);
            return [];
        }
    }
    async register(signerPrivateKey, capability, minPriceWei) {
        const wallet = new ethers_1.ethers.Wallet(signerPrivateKey, this.provider);
        const contract = new ethers_1.ethers.Contract(this.registryAddress, REGISTRY_ABI, wallet);
        const tx = await contract.registerAgent(capability, minPriceWei);
        console.log(`Registration tx sent: ${tx.hash}`);
        await tx.wait();
        return tx.hash;
    }
}
exports.ContractResolver = ContractResolver;
