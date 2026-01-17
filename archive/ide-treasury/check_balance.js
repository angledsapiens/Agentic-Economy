import { createConsoleClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

const circleClient = createConsoleClient({
  apiKey: process.env.CIRCLE_API_KEY || '',
});

async function findWallets() {
  console.log('--- Searching for Circle Wallets (JS) ---');
  try {
    const response = await circleClient.listWallets({
      pageSize: 10
    });

    if (response.data?.wallets && response.data.wallets.length > 0) {
      console.log(`Found ${response.data.wallets.length} wallet(s):`);
      for (const wallet of response.data.wallets) {
        console.log(`- ID: ${wallet.id}, address: ${wallet.address}`);

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
    console.error('Error finding wallets:', error.message);
  }
}

findWallets();
