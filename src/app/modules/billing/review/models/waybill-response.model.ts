export interface WayBillsData {
    baseAmount: number;
    cgstAmount: number;
    createdDate: Date;
    deliveryDate: Date;
    destinationCode: string;
    destinationId: number;
    igstAmount: number;
    originCode: string;
    originId: number;
    outstandingAmount: number;
    pickupDate: Date;
    pkg: number;
    sfxCode: string;
    sgstAmount: number;
    ttlTaxAmount: number;
    waybillId: number;
    waybillNumber: string;
    weight: number;
}
