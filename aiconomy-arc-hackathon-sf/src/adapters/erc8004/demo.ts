import { ERC8004Registry } from './registry';
import { ERC8004Adapter } from './adapter';
import { CommerceProfile, ProfileStatus } from '../../core/profile';
import * as dotenv from 'dotenv';

// Load ENV vars
dotenv.config();

/**
 * Demo Script: ERC-8004 Live Discovery
 * Run with: npx ts-node src/adapters/erc8004/demo.ts
 */
async function runDemo() {
  const mode = process.env.LIS_MODE || 'LOCAL';
  console.log(`--- Starting ERC-8004 Demo [Mode: ${mode}] ---`);

  if (mode === 'TESTNET') {
    if (!process.env.EVM_PRIVATE_KEY || !process.env.REGISTRY_ADDRESS) {
      console.warn(' ! Missing EVM keys/address in .env. Falling back to Mock store logic if applicable.');
    } else {
      console.log(` ! Connecting to Registry at ${process.env.REGISTRY_ADDRESS}`);
    }
  }

  // 1. Setup Environment
  // Registry will automatically parse process.env.REGISTRY_ADDRESS etc inside constructor if not passed,
  // but we can pass explicitly if needed.
  const registry = new ERC8004Registry(
    process.env.REGISTRY_ADDRESS,
    process.env.EVM_RPC_URL, // e.g. ARC Testnet RPC
    process.env.EVM_PRIVATE_KEY
  );

  const adapter = new ERC8004Adapter(registry);

  // 2. Create a Mock Agent Profile
  const agentProfile: CommerceProfile = {
    id: 'did:pkh:eip155:8453:0xDemoAgent',
    name: `Agent ${Date.now()}`, // Unique name for demo
    address: '0x1234567890123456789012345678901234567890',
    controlledBy: 'did:pkh:master-key',
    status: ProfileStatus.ACTIVE,
    capabilities: ['LIP_TEXT_GEN', 'LIP_CODE_REVIEW'],
    activePolicyId: 'policy-001',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 3. Publish Agent to Registry
  try {
    console.log('\n[1] Publishing Agent Profile...');
    const txId = await adapter.publish(agentProfile);
    console.log(` > Registration Successful. Tx ID: ${txId}`);
  } catch (e: any) {
    console.error(` > Registration Failed: ${e.message}`);
  }

  // 4. Discover Agents by Capability
  try {
    console.log('\n[2] Discovering Agents with capability "LIP_TEXT_GEN"...');
    const foundAgents = await adapter.discover('LIP_TEXT_GEN');

    if (foundAgents.length > 0) {
      console.log(` > Found ${foundAgents.length} agent(s):`);
      foundAgents.slice(0, 5).forEach(a => { // Show top 5
        console.log(`   - ${a.name} (${a.paymentAddress}) [${a.capabilities.join(', ')}]`);
      });
    } else {
      console.warn(' > No agents found!');
    }
  } catch (e: any) {
    console.error(` > Discovery Failed: ${e.message}`);
  }

  console.log('\n--- Demo Complete ---');
}

runDemo().catch(console.error);
