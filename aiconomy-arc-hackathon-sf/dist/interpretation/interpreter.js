"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpret = interpret;
const interpretation_1 = require("../core/interpretation");
/**
 * Intent Interpreter (Pure Module)
 * Translates high-level, human-readable templates into canonical InterpretedIntents.
 */
function interpret(template) {
    switch (template.templateType) {
        case 'BUY_SERVICE':
            return interpretBuy(template);
        case 'SELL_SERVICE':
            return interpretSell(template);
        default:
            // TypeScript should catch this exhaustiveness check if templates are exhaustive
            throw new Error(`Unknown template type: ${template.templateType}`);
    }
}
function interpretBuy(t) {
    return {
        type: interpretation_1.IntentType.BUY,
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
function interpretSell(t) {
    return {
        type: interpretation_1.IntentType.SELL,
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
