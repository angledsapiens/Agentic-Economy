"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialExporter = void 0;
class FinancialExporter {
    toQuickBooksXML(receipts) {
        let xml = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
        xml += '<?qbxml version="13.0"?>\n<QBXML>\n<QBXMLMsgsRs>\n';
        receipts.forEach(r => {
            xml += `  <BillAddRs>
    <TransactionID>${r.settlementTx}</TransactionID>
    <RefNumber>${r.missionId}</RefNumber>
    <Memo>Audit Hash: ${r.deliveryArtifactHash}</Memo>
  </BillAddRs>\n`;
        });
        xml += '</QBXMLMsgsRs>\n</QBXML>';
        return xml;
    }
    toXeroJSON(receipts) {
        const xeroData = {
            Invoices: receipts.map(r => ({
                Type: "ACCPAY",
                Reference: r.missionId,
                LineItems: [{
                        Description: `Settlement TX: ${r.settlementTx}. Hash: ${r.intentHash}`,
                        Quantity: 1,
                        UnitAmount: 0 // In a real app, this would be the actual amount from the intent
                    }],
                Url: `https://agentic.economy/receipt/${r.deliveryArtifactHash}`
            }))
        };
        return JSON.stringify(xeroData, null, 2);
    }
}
exports.FinancialExporter = FinancialExporter;
