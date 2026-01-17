const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config();

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin')) {
    const nodeModulesPath = path.resolve(__dirname, 'node_modules', importPath);
    if (fs.existsSync(nodeModulesPath)) {
      return { contents: fs.readFileSync(nodeModulesPath, 'utf8') };
    } else {
      return { error: 'File not found: ' + nodeModulesPath };
    }
  }
  return { error: 'File not found' };
}

async function main() {
  console.log("Reading Registry.sol...");
  const contractPath = path.resolve(__dirname, 'src/playground/Registry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'Registry.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  console.log("Compiling...");
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    output.errors.forEach((err) => {
      console.error(err.formattedMessage);
    });
    if (output.errors.some(e => e.severity === 'error')) process.exit(1);
  }

  const contractFile = output.contracts['Registry.sol']['AgentRegistry'];
  const bytecode = contractFile.evm.bytecode.object;
  const abi = contractFile.abi;

  console.log("Deployment Bytecode Size:", bytecode.length);

  // Deployment
  const privateKey = process.env.SELLER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("SELLER_PRIVATE_KEY missing in .env");
    process.exit(1);
  }

  const rpcUrl = process.env.TESTNET_RPC_URL || 'https://sepolia.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deploying from: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  try {
    const contract = await factory.deploy();
    const txHash = contract.deploymentTransaction().hash;
    console.log(`Deploy Tx: ${txHash}`);

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("-----------------------------------------");
    console.log(`Registry Deployed At: ${address}`);
    console.log("-----------------------------------------");

  } catch (e) {
    console.error("Deployment Failed:", e);
  }
}

main();
