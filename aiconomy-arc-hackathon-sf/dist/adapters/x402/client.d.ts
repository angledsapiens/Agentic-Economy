import { SettlementEngine } from '../../settlement/engine';
import { CommerceProfile, CommercePolicy } from '../../core/profile';
/**
 * X402 Client
 *
 * An autonomous HTTP client that handles 402 Payment Required responses.
 * It integrates the full LIS stack: Interpret -> Fiduciary -> Treasury -> Settle.
 */
export declare class X402Client {
    private guardian;
    private engine;
    private profile;
    private policy;
    private fetcher;
    constructor(profile: CommerceProfile, policy: CommercePolicy, engine: SettlementEngine, fetcher?: (url: string, options: any) => Promise<any>);
    /**
     * Performs an HTTP request.
     * If it encounters a 402, it attempts to pay and retry (once).
     */
    fetch(url: string, options?: any): Promise<any>;
    private parsePriceHeader;
    private defaultFetch;
}
