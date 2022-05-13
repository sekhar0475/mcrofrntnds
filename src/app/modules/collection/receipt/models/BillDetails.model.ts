export interface BillDetails {
    documentId: number;
    documentNumber: string;
    documentType: string;
    documentDate: Date;
    actualAmount: number;
    outstandingAmount: number;
    customerName: string;
    billingLevelValue: string;
    tanNumber: string;
    prcId: number;
    cnorId: number;
    cneeId: number;
    appliedFrtAmt: number;
    appliedFrtTdsAmt: number;
    appliedGstTdsAmt: number;
    reason: string;
    status: string;
    expectedCollDt: Date;
}

