const sdk = require('@circle-fin/developer-controlled-wallets');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function getWalletAddress() {
  console.log('--- Retrieving Treasury Wallet Address ---\n');

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.ENTITY_SECRET;
  const walletId = process.env.WALLET_ID;

  if (!apiKey || !entitySecret || !walletId) {
    throw new Error('CIRCLE_API_KEY, ENTITY_SECRET, or WALLET_ID missing in .env');
  }

  // Initialize client
  const client = sdk.initiateDeveloperControlledWalletsClient({
    apiKey: apiKey,
    entitySecret: entitySecret
  });

  try {
    console.log('Calling client.getWallet...');
    const response = await client.getWallet({ id: walletId });

    if (response.data && response.data.wallet && response.data.wallet.address) {
      const address = response.data.wallet.address;

      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('███████████████████████████████████████████████████████████');
      console.log('███                                                     ███');
      console.log('███   TREASURY WALLET ADDRESS (FUND THIS ADDRESS!)     ███');
      console.log('███                                                     ███');
      console.log(`███   ${address}   ███`);
      console.log('███                                                     ███');
      console.log('███████████████████████████████████████████████████████████');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('\n');

      // Update .env with TREASURY_ADDRESS
      let envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('TREASURY_ADDRESS=')) {
        envContent = envContent.replace(/TREASURY_ADDRESS=.*/, `TREASURY_ADDRESS=${address}`);
      } else {
        envContent += `\nTREASURY_ADDRESS=${address}`;
      }
      fs.writeFileSync('.env', envContent);
      console.log('✅ Saved TREASURY_ADDRESS to .env\n');

      return address;
    } else {
      console.error('Failed to retrieve wallet address. Response structure unexpected.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Failed to get wallet:', error.message);
    if (error.response && error.response.data) {
      console.error('Error Response:', error.response.data);
    }
    process.exit(1);
  }
}

getWalletAddress();
