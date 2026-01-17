import { HEADER_L402_PRICE, HEADER_AUTHORIZATION } from './types';

/**
 * X402 Server Middleware
 *
 * Simulates a server-side interceptor that:
 * 1. Checks for Payment Proof (x402-proof).
 * 2. Validates Proof (via Settlement Provider check - Stubbed here).
 * 3. Allows access OR returns 402 Payment Required.
 */
export class X402Server {
  private priceMap: Map<string, string> = new Map();
  private sellerDID: string;

  constructor(sellerDID: string) {
    this.sellerDID = sellerDID;
  }

  /**
   * Register a price for a resource path.
   */
  setPrice(path: string, priceInWei: string) {
    this.priceMap.set(path, priceInWei);
  }

  /**
   * Handles an incoming request.
   * Returns a simulated "Response" object (status, headers, body).
   */
  async handleRequest(path: string, headers: any): Promise<any> {
    const price = this.priceMap.get(path);

    // 1. Free Resource
    if (!price) {
      return { status: 200, body: `Success: Free access to ${path}` };
    }

    // 2. Check for Proof
    const authHeader = headers[HEADER_AUTHORIZATION];
    if (authHeader && authHeader.startsWith('x402-proof ')) {
      const txId = authHeader.split(' ')[1];
      console.log(`[X402Server] Validating on-chain proof (TxHash): ${txId}...`);

      // STUB: Verify txId against chain/settlement provider
      // For Sprint 5 we assume any non-empty proof is valid if it exists
      if (txId) {
        return { status: 200, body: `Success: Paid access to ${path}. Proof accepted.` };
      }
    }

    // 3. Issue 402 Challenge
    return {
      status: 402,
      headers: {
        [HEADER_L402_PRICE]: `${price};USDC;${this.sellerDID}`,
        'WWW-Authenticate': 'x402-proof'
      },
      body: 'Payment Required'
    };
  }
}
