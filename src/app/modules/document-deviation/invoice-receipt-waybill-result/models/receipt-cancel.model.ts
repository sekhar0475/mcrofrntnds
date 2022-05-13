export interface ReceiptCancel {
    receiptId: number;
    receiptNum: string;
    reason: string;
    reasonId: number;
    remarks: string;
    newReceiptFlag: string;
    insmtRef: string;
    insmtRefDt: Date;
    sfxBankAcc: string;
    attachmentfileName: string;
    s3BucketName: string;
}
