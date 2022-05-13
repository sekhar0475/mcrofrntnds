import { SelectedWaybillData } from "./selected-waybill.model";

export interface RandomCreditCustomerDetails {
    billingLevel : string;
    billingLevelValue : string;
    billingLevelId: string;
    billToAddr:string;
    billingByLevel : string;
    billingByLevelId :string;
    billingByOptionId :  number;
    billingConfigId: string;
    billingFromDate: string;
    billingEndDate: string;

    serviceOfferingId: number;
    businessTypeId: number;
    autoBillFlag: number;
    minBlngAmt: number;

    businessType: string;
    pymtTermName: string;
    billingCycle: string;
    billingCycleId: number;
    blngBr : string;
    blngBrId : number;
    collBr : string;
    collBrId : number;
    submsnBr : string;
    submsnBrId : number;
    aliasName: String;
    msaName : string;
    msaId : number;
    gstNum : string;
    gstinRegdFlag : string;
    msaCode : string;
    sfxId : number;
    sfxCode : string;
    rateCardId : number;
    rateCardCode : string;
    email : string;
    eBillFlag : number;
    billToAddrId : number;
    billToAddrLine1 : string;
    billToAddrLine2 : string;
    billToAddrLine3 : string;
    billToLocation : string;
    billToPincode : number;
    billToCity : string;
    billToState : string;
    branchIds: any;
    assgnbranchIds: any;
    subTypeId: number;
    subType: string;
    subTypeValue: string;
    waybillsData: SelectedWaybillData;

}
