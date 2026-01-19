/**
 * x402 Micropayment Standards
 * Defines headers and payload structures for autonomous payments.
 */
export declare const HEADER_L402_PRICE = "L402-Price";
export declare const HEADER_AUTHORIZATION = "Authorization";
export interface X402PriceChallenge {
    amount: string;
    asset: string;
    recipient: string;
    opaque?: string;
}
export interface X402Proof {
    type: 'x402-proof';
    transactionId: string;
}
