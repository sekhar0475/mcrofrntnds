export interface AppliedReceipt {
    receiptId: number;
    receiptAplnId: number;
    billingLevelValue: string;
    documentDate: Date;
    documentId: string;
    documentNumber: string;
    customerName: string;
    reason: string;
    status: string;
    expectedColDt: Date;
    outstandingFrtAmt: number;
    outstandingGstTdsAmt: number;
    outstandingTdsAmt: number;
}
