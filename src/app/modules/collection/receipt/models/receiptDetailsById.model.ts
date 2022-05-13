export interface ReceiptDetailsWithId {
    receiptId: number;
    receiptNum: string;
    custType: string;
    custName: string;
    custId: string;
    totRecFrtAmt: number;
    totRecFrtTdsAmt: number;
    totRecGstTdsAmt: number;
    outstandingFrtAmt: number;
    outstandingGstTdsAmt: number;
    outstandingTdsAmt: number;
    allowAttachment: boolean;
    remarks: string;
}
