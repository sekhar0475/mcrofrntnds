export interface ReceiptApplication {
    receiptApplnId: number;
    receiptId: number;
    documentType: string;
    documentNumber: string;
    documentId: number;
    documentDate: Date;
    appliedFrtAmt: number;
    appliedFrtTdsAmt: number;
    appliedGstTdsAmt: number;
    reason: string;
    status: string;
    expectedCollDt: Date;
    attachedFileName: string;
}

