import { AssetProfile } from './assets';
import { EnvelopeType } from './constants';

export interface LiquidityIntent {
  id: string; // Unique identifier for the intent
  buyer: string; // Address of the buyer
  seller: string; // Address of the seller
  asset: AssetProfile;
  amount: string; // Amount in atomic units (e.g. Wei)
  envelopeType: EnvelopeType;
  deadline: number; // Unix timestamp
  metadata?: Record<string, any>; // Optional flexible metadata
}

export interface IntentCommitment {
  intentId: string;
  signature: string; // Seller's signature
}
