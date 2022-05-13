export interface RandomSearchParam {
    batchDetailId: number;
    batchId: number;
    billingBylevelId: number;
    billingCycle: string;
    billingCycleId: number;
    billingEndDate: string;
    billingFromDate: string;
    billingLevel: string;
    billingLevelId: number;
    billingLevelValue: string;
    billingTypeId: number;
    branchIds: [number];
    businessTypeId: number;
    consigneeId: [number];
    consignorId: [number];
    customerContracts: [number];
    msaCode: string;
    msaId: number;
    offeringId: number;
    offeringValue: string;
    rateCardId: [number];
}