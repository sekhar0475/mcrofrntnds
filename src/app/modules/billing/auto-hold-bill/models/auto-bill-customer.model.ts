export interface AutoBillCustomer {
    customerName: string;
    aliasName: string;
    msaId: number;
    msaCode: string;
    sfxCode: string;
    rateCardCode: string;
    billingCycle: string;
    billingLevel: string;
    reason: string;
    status: string;
    holdDate: Date;
    holdId: number;
    billConfigId: number;
    billingLevelId: number;
    billingLevelCode: string;
}
