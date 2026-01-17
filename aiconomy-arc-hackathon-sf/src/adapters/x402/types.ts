/**
 * x402 Micropayment Standards
 * Defines headers and payload structures for autonomous payments.
 */

export const HEADER_L402_PRICE = 'L402-Price'; // e.g. "1000;USDC;did:pkh:..."
export const HEADER_AUTHORIZATION = 'Authorization'; // e.g. "x402-proof <tx_hash>"

export interface X402PriceChallenge {
  amount: string;
  asset: string;
  recipient: string; // DID or Address
  opaque?: string;
}

export interface X402Proof {
  type: 'x402-proof';
  transactionId: string; // The On-Chain Settlement Transaction Hash
}
