export interface Receipt {
mode: string;
receiptNum: string;
receiptId: number;
insmtType: string;
custType: string;
custId: number;
custName: string;
billingLevel: string;
billingLevelId: string;
billingLevelValue: string;
totRecFrtAmt: number;
totRecFrtTdsAmt: number;
totRecGstTdsAmt: number;
insmtRef: string;
insmtRefDt: Date;
custBankBr: string;
custbankAcc: string;
safexBankAcc: string;
tanNum: string;
remarks: string;
attachmentfileName: string;
s3BucketName: string;
oraReceiptMethod: string;
}
