import { circleClient } from './circle.ts';

async function findWallets() {
  console.log('--- Searching for Circle Wallets ---');
  try {
    const response = await circleClient.listWallets({
      pageSize: 10
    });

    if (response.data?.wallets && response.data.wallets.length > 0) {
      console.log(`Found ${response.data.wallets.length} wallet(s):`);
      for (const wallet of response.data.wallets) {
        console.log(`- ID: ${wallet.id}, Status: ${wallet.state}, address: ${wallet.address}`);

        // Fetch balance for each wallet
        const balanceResponse = await circleClient.getWalletTokenBalance({
          id: wallet.id || '',
          tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // USDC on Base Sepolia
        });
        console.log(`  Balance: ${balanceResponse.data?.tokenBalance?.amount || '0'} USDC`);
      }
    } else {
      console.log('No wallets found.');
    }
  } catch (error) {
    console.error('Error finding wallets:', error);
  }
}

findWallets();
