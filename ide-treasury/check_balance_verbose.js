const sdk = require('@circle-fin/developer-controlled-wallets');
const dotenv = require('dotenv');
const util = require('util');

dotenv.config();

async function checkBalanceVerbose() {
  console.log('--- Detailed Treasury Balance Check ---\n');

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.ENTITY_SECRET;
  const walletId = process.env.WALLET_ID;

  if (!apiKey || !entitySecret || !walletId) {
    throw new Error('Missing required environment variables');
  }

  const client = sdk.initiateDeveloperControlledWalletsClient({
    apiKey: apiKey,
    entitySecret: entitySecret
  });

  try {
    console.log(`Fetching wallet: ${walletId}\n`);

    const response = await client.getWallet({ id: walletId });

    console.log('Full API Response:');
    console.log(util.inspect(response, { depth: 5, colors: true }));
    console.log('\n');

    if (response.data && response.data.wallet) {
      const wallet = response.data.wallet;

      console.log('\n═══════════════════════════════════════════════════');
      console.log('           TREASURY WALLET DETAILS');
      console.log('═══════════════════════════════════════════════════\n');

      console.log(`Wallet ID:    ${wallet.id}`);
      console.log(`Address:      ${wallet.address}`);
      console.log(`Blockchain:   ${wallet.blockchain}`);
      console.log(`State:        ${wallet.state}`);
      console.log(`Wallet Set:   ${wallet.walletSetId}`);
      console.log(`Created:      ${wallet.createDate}`);
      console.log(`Updated:      ${wallet.updateDate}\n`);

      console.log('Balances Array:');
      console.log(util.inspect(wallet.balances, { depth: 3, colors: true }));
      console.log('\n');

      if (wallet.balances && wallet.balances.length > 0) {
        console.log('🎉 TOKEN BALANCES FOUND!\n');
        console.log('───────────────────────────────────────────────────');

        wallet.balances.forEach(balance => {
          console.log(`Token: ${balance.token || 'UNKNOWN'}`);
          console.log(`Amount: ${balance.amount || '0'}`);
          console.log(`Update Date: ${balance.updateDate || 'N/A'}`);
          console.log('───────────────────────────────────────────────────');
        });

        const usdcBalance = wallet.balances.find(b => b.token === 'USDC');
        if (usdcBalance) {
          console.log('\n💰 USDC BALANCE: ' + usdcBalance.amount + ' USDC\n');
        }
      } else {
        console.log('⚠️  No token balances in response.');
        console.log('This could mean:');
        console.log('  1. The wallet was just funded and Circle API needs time to sync');
        console.log('  2. The transaction is still pending');
        console.log('  3. The wallet needs to be funded\n');
      }

      console.log('═══════════════════════════════════════════════════\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response && error.response.data) {
      console.error('API Error:', util.inspect(error.response.data, { depth: 3, colors: true }));
    }
    process.exit(1);
  }
}

checkBalanceVerbose();
