export interface SelectedWaybillData {
    waybillCount : number;
    selectedWaybillCount : number;
    waybills : Waybills[];
}


export interface Waybills {
    waybillId: number;
    waybillNumber: string;
    creationDate: string;
    deliveryDate: string;
    pickupDate: string;
    baseAmount: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    ttlTaxAmount: string;
    outstandingAmount: string;
}