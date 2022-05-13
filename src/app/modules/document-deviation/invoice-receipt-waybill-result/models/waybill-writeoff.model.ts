export interface WaybillWriteOff {
    documentId: number;
    documentNum: string;
    documentType: string;
    writeOffReason: string;
    writeOffAmt: number;
    documentDt: Date;
    outStandingAmt: number;
    remarks: string;
    status: string;
    message: string;
}
