const sdk = require('@circle-fin/developer-controlled-wallets');
const dotenv = require('dotenv');

dotenv.config();

async function checkBalance() {
  console.log('--- Checking Treasury USDC Balance on Base Sepolia ---\n');

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.ENTITY_SECRET;
  const walletId = process.env.WALLET_ID;
  const treasuryAddress = process.env.TREASURY_ADDRESS;

  if (!apiKey || !entitySecret || !walletId) {
    throw new Error('CIRCLE_API_KEY, ENTITY_SECRET, or WALLET_ID missing in .env');
  }

  // Initialize client
  const client = sdk.initiateDeveloperControlledWalletsClient({
    apiKey: apiKey,
    entitySecret: entitySecret
  });

  try {
    console.log(`Wallet ID: ${walletId}`);
    console.log(`Address: ${treasuryAddress}\n`);

    console.log('Fetching wallet details...');
    const response = await client.getWallet({ id: walletId });

    if (response.data && response.data.wallet) {
      const wallet = response.data.wallet;

      console.log('\n═══════════════════════════════════════════════════');
      console.log('           TREASURY WALLET BALANCE');
      console.log('═══════════════════════════════════════════════════\n');

      console.log(`Blockchain: ${wallet.blockchain}`);
      console.log(`State: ${wallet.state}`);
      console.log(`Address: ${wallet.address}\n`);

      // Check for token balances
      if (wallet.balances && wallet.balances.length > 0) {
        console.log('Token Balances:');
        console.log('───────────────────────────────────────────────────');

        wallet.balances.forEach(balance => {
          const amount = balance.amount || '0';
          const token = balance.token || 'UNKNOWN';
          console.log(`  ${token}: ${amount}`);

          if (token === 'USDC') {
            console.log('\n🎉 USDC Balance Found!');
            console.log(`💰 Amount: ${amount} USDC\n`);
          }
        });
      } else {
        console.log('⚠️  No token balances found.');
        console.log('💡 The wallet may need to be funded first.\n');
      }

      console.log('═══════════════════════════════════════════════════\n');

    } else {
      console.error('Failed to retrieve wallet details.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Failed to check balance:', error.message);
    if (error.response && error.response.data) {
      console.error('Error Response:', error.response.data);
    }
    process.exit(1);
  }
}

checkBalance();
