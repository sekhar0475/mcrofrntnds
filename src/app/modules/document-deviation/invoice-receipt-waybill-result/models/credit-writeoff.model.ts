export interface CreditWriteOff {
    documentId: number;
    documentNumber: string;
    documentType: string;
    writeOffReason: string;
    writeOffAmt: number;
    documentDt: Date;
    outStandingAmt: number;
    remarks: string;
    status: string;
    message: string;
}
