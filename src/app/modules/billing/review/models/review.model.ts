export interface Review {
    billBatchId: number;
    batchNum: number;
    phase : string
    status: string;
    requestDt: Date;
    message: string;
    billingCycle: string;
    batchType: string;
    createdBy: string;
}

