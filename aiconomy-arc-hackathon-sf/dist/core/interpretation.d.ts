/**
 * Intent Interpretation Layer Types
 * Defines the semantic "meaning" of an agent's action.
 */
export declare enum IntentType {
    BUY = "BUY",
    SELL = "SELL",
    NEGOTIATE = "NEGOTIATE",
    SETTLE = "SETTLE"
}
/**
 * Valid metadata types for interpreted intents.
 * Removes 'any' to ensure type safety.
 */
export type IntentMetadata = BuyServiceTemplate | SellServiceTemplate;
export interface CommerceSubject {
    name: string;
    description: string;
}
export interface SettlementTerms {
    asset: string;
    amount: string;
}
/**
 * A canonical, interpretable description of what an agent intends to do.
 * This is produced by the Interpreter and consumed by the Fiduciary.
 */
export interface InterpretedIntent {
    type: IntentType;
    counterparty: string;
    reasoning: string;
    subject: CommerceSubject;
    settlement: SettlementTerms;
    metadata: IntentMetadata;
}
export interface BuyServiceTemplate {
    templateType: 'BUY_SERVICE';
    serviceName: string;
    sellerDID: string;
    maxPrice: string;
    description: string;
}
export interface SellServiceTemplate {
    templateType: 'SELL_SERVICE';
    serviceName: string;
    buyerDID: string;
    price: string;
}
export type IntentTemplate = BuyServiceTemplate | SellServiceTemplate;
