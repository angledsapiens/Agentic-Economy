
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';
dotenv.config();

async function checkDupes() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.ENTITY_SECRET!
  });

  const end = new Date();
  const start = new Date(end.getTime() - 5 * 60 * 1000); // Last 5 mins

  console.log(`Checking transactions from ${start.toISOString()} to ${end.toISOString()}...`);

  const response = await client.listTransactions({
    from: start,
    to: end,
    pageSize: 20
  });

  const txs = response.data?.transactions || [];
  console.log(`Found ${txs.length} transactions.`);

  txs.forEach(tx => {
    console.log(`[${tx.createDate}] ID: ${tx.id} State: ${tx.state} Type: ${tx.transactionType}`);
  });

  if (txs.length > 1) {
    console.log('⚠️ POTENTIAL DUPLICATES FOUND!');
  } else {
    console.log('✅ No obvious duplicates found in the last 5 minutes.');
  }
}

checkDupes().catch(console.error);
