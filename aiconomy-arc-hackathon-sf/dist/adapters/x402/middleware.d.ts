/**
 * X402 Server Middleware
 *
 * Simulates a server-side interceptor that:
 * 1. Checks for Payment Proof (x402-proof).
 * 2. Validates Proof (via Settlement Provider check - Stubbed here).
 * 3. Allows access OR returns 402 Payment Required.
 */
export declare class X402Server {
    private priceMap;
    private sellerDID;
    constructor(sellerDID: string);
    /**
     * Register a price for a resource path.
     */
    setPrice(path: string, priceInWei: string): void;
    /**
     * Handles an incoming request.
     * Returns a simulated "Response" object (status, headers, body).
     */
    handleRequest(path: string, headers: any): Promise<any>;
}
