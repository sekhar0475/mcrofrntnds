export interface ReceiptSummary {
    receiptNumber: string;
    receiptId: number;
    receiptDate: Date;
    insmtRef: string;
    customerName: string;
    outstandingAmt: number;
    appliedAmt: number;
}
