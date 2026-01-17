import { AuditReceipt } from './receipt';
export declare class FinancialExporter {
    toQuickBooksXML(receipts: AuditReceipt[]): string;
    toXeroJSON(receipts: AuditReceipt[]): string;
}
