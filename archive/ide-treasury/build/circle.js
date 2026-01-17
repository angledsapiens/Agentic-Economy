import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';
import { validateSpend, recordSpend } from './guardrails.js';
dotenv.config();
const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY || '',
    entitySecret: process.env.ENTITY_SECRET || '' // Used for signing
});
export async function getAgentBalance() {
    try {
        const walletId = process.env.WALLET_ID;
        if (!walletId) {
            throw new Error('WALLET_ID is not defined in environment variables.');
        }
        const response = await circleClient.getWalletTokenBalance({
            id: walletId,
            tokenAddresses: [process.env.USDC_TOKEN_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e']
        });
        // Handle tokenBalances array response
        const balances = response.data?.tokenBalances || [];
        return balances[0]?.amount || '0';
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
}
export async function executePayment(amount, recipient, taskId = 'default') {
    try {
        const walletId = process.env.WALLET_ID;
        if (!walletId) {
            throw new Error('WALLET_ID is not defined in environment variables.');
        }
        // Convert amount to number for budget validation
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            throw new Error(`Invalid payment amount: ${amount}`);
        }
        // FIDUCIARY LAYER: Validate budget before executing payment
        validateSpend(amountNum, taskId);
        const response = await circleClient.createTransaction({
            walletId,
            tokenAddress: process.env.USDC_TOKEN_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            blockchain: 'BASE-SEPOLIA',
            amounts: [amount],
            destinationAddress: recipient,
            fee: {
                type: 'level',
                config: {
                    feeLevel: 'MEDIUM'
                }
            }
        });
        // Record the spend after successful transaction
        recordSpend(amountNum, taskId);
        return response.data?.id || '';
    }
    catch (error) {
        console.error('Error executing payment:', error);
        throw error;
    }
}
export { circleClient };
