import { getAgentBalance } from './circle.js';
async function main() {
    console.log('--- Circle Wallet Bridge ---');
    try {
        // 1. Fetch balance
        console.log('Fetching agent balance...');
        const balance = await getAgentBalance();
        console.log(`Current Balance: ${balance} USDC`);
        // 2. Example payment (commented out for safety)
        /*
        console.log('Executing test payment...');
        const txHash = await executePayment('1.0', '0xRecipientAddressGoesHere');
        console.log(`Payment executed. Transaction Hash: ${txHash}`);
        */
    }
    catch (error) {
        console.error('An error occurred in the bridge:', error);
        process.exit(1);
    }
}
main();
