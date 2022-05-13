export interface UploadResult {
    documentId: number;
    documentNumber: string;
    documentType: string;
    documentDt: Date;
    outStandingAmt: DoubleRange;
    writeOffAmt: DoubleRange;
    writeOffReason: string;
    remarks: string;
    status: string;
    message: string;
}
