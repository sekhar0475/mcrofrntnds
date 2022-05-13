export interface DocumentWriteOff {
    documentId: number;
    documentNum: string;
    documentType: string;
    documentDt: Date;
    outstandingAmt: number;
    writeOffAmt: number;
    writeOffReason: string;
    remarks: string;
    status: string;
    message: string;
    documentRefNum: string;
    documentRefDt: Date;
    cancelReson: string;
    cancelId: number;
    cancelRemarks: string;
    newDocumentRefNum: string;
    sfxBankAcc: string;
}
