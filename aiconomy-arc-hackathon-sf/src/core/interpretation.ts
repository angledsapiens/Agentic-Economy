/**
 * Intent Interpretation Layer Types
 * Defines the semantic "meaning" of an agent's action.
 */

export enum IntentType {
  BUY = 'BUY',
  SELL = 'SELL',
  NEGOTIATE = 'NEGOTIATE',
  SETTLE = 'SETTLE'
}

/**
 * Valid metadata types for interpreted intents.
 * Removes 'any' to ensure type safety.
 */
export type IntentMetadata = BuyServiceTemplate | SellServiceTemplate;

export interface CommerceSubject {
  name: string;        // The "What" (e.g. "LIP_TEXT_GEN")
  description: string; // Human readable description
}

export interface SettlementTerms {
  asset: string;       // The "How" (e.g. "USDC")
  amount: string;      // The "How Much" (wei)
}

/**
 * A canonical, interpretable description of what an agent intends to do.
 * This is produced by the Interpreter and consumed by the Fiduciary.
 */
export interface InterpretedIntent {
  type: IntentType;

  // Who are we dealing with?
  counterparty: string;

  // Why is this happening? (Human Explanation)
  reasoning: string;

  // What is the commerce subject?
  subject: CommerceSubject;

  // What are the financial terms?
  settlement: SettlementTerms;

  // Original Template Data
  metadata: IntentMetadata;
}

// --- Templates ---

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
