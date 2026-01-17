const sdk = require('@circle-fin/developer-controlled-wallets');
const fs = require('fs');
const dotenv = require('dotenv');
const util = require('util');

dotenv.config();

async function createWallet() {
  console.log('--- Creating Circle Treasury Wallet (SDK Method + Safe Logging) ---');

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.ENTITY_SECRET;
  const walletSetId = process.env.WALLET_SET_ID;

  if (!apiKey || !entitySecret || !walletSetId) {
    throw new Error('CIRCLE_API_KEY, ENTITY_SECRET, or WALLET_SET_ID missing in .env');
  }

  // Initialize client
  const client = sdk.initiateDeveloperControlledWalletsClient({
    apiKey: apiKey,
    entitySecret: entitySecret
  });

  try {
    console.log('Calling client.createWallets...');
    const response = await client.createWallets({
      blockchains: ['BASE-SEPOLIA'],
      count: 1,
      walletSetId: walletSetId
    });

    console.log('API Response:', util.inspect(response, { depth: 4, colors: false }));

    if (response.data && response.data.wallets && response.data.wallets.length > 0) {
      const wallet = response.data.wallets[0];
      console.log('\n=========================================');
      console.log('SUCCESSFULLY CREATED TREASURY WALLET');
      console.log(`Wallet ID:      ${wallet.id}`);
      console.log(`Wallet Address: ${wallet.address}`);
      console.log('=========================================\n');

      // Update .env
      let envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('WALLET_ID=')) {
        envContent = envContent.replace(/WALLET_ID=.*/, `WALLET_ID=${wallet.id}`);
      } else {
        envContent += `\nWALLET_ID=${wallet.id}`;
      }
      fs.writeFileSync('.env', envContent);
      console.log('Saved WALLET_ID to .env.');
    } else {
      console.error('Failed to create wallet. Response structure unexpected.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Failed to create wallet:', error.message);
    if (error.response && error.response.data) {
      console.log('Error Response Data:');
      console.log(util.inspect(error.response.data, { depth: 4, colors: false }));
    }
    if (error.errors) {
      console.log('SDK Errors:');
      console.log(util.inspect(error.errors, { depth: 4, colors: false }));
    }
    process.exit(1);
  }
}

createWallet();
