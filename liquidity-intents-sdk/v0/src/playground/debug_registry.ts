import { ContractResolver } from '../discovery/contract-resolver';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const rpcUrl = process.env.TESTNET_RPC_URL || 'https://sepolia.base.org';
  const registryAddress = process.env.REGISTRY_ADDRESS;

  if (!registryAddress) { console.error("Missing REGISTRY_ADDRESS"); return; }

  console.log(`Querying Registry at ${registryAddress}...`);
  const resolver = new ContractResolver(rpcUrl, registryAddress);

  const capability = 'LIP_TEXT';
  try {
    const agents = await resolver.getAgents(capability);
    console.log(`Found ${agents.length} agents for ${capability}:`);
    console.log(JSON.stringify(agents, null, 2));
  } catch (e) {
    console.error("Query Failed:", e);
  }
}

main();
