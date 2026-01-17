import {
  IntentTemplate,
  InterpretedIntent,
  IntentType,
  BuyServiceTemplate,
  SellServiceTemplate
} from '../core/interpretation';

/**
 * Intent Interpreter (Pure Module)
 * Translates high-level, human-readable templates into canonical InterpretedIntents.
 */

export function interpret(template: IntentTemplate): InterpretedIntent {
  switch (template.templateType) {
    case 'BUY_SERVICE':
      return interpretBuy(template);
    case 'SELL_SERVICE':
      return interpretSell(template);
    default:
      // TypeScript should catch this exhaustiveness check if templates are exhaustive
      throw new Error(`Unknown template type: ${(template as any).templateType}`);
  }
}

function interpretBuy(t: BuyServiceTemplate): InterpretedIntent {
  return {
    type: IntentType.BUY,
    counterparty: t.sellerDID,
    reasoning: `Buying service '${t.serviceName}' from ${t.sellerDID}.`,
    subject: {
      name: t.serviceName,
      description: t.description
    },
    settlement: {
      asset: 'USDC', // Default for Sprint 2
      amount: t.maxPrice
    },
    metadata: t
  };
}

function interpretSell(t: SellServiceTemplate): InterpretedIntent {
  return {
    type: IntentType.SELL,
    counterparty: t.buyerDID,
    reasoning: `Selling service '${t.serviceName}' to ${t.buyerDID}.`,
    subject: {
      name: t.serviceName,
      description: `Sale of ${t.serviceName}`
    },
    settlement: {
      asset: 'USDC',
      amount: t.price
    },
    metadata: t
  };
}
