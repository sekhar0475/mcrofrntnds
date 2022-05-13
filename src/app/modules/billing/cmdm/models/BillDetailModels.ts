export interface WMSBillDetailRequest {
  documentNumber: string;
  sameBillingLevel: boolean;
}

export interface BillDetailResponse {
  billingLevelId: number;
  oracleArTrasactionId: string;
  custAccountId: number;
  custSiteUseId: number;
  oracleTaxRate: number;
  oracleTaxRateCode: string;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  baseAmt: number;
  gstNum: string;
  ttlTaxAmt: number;
  billId: number;
  billNum: string;
  billType: string;
  billToCustName: string;
  billToAddr: string;
  billToAddressId: string;
  billCtgy: string;
  altCollBrId: number;
  billDt: Date;
  custMsaId: number;
  custMsaCode: string;
  collBrId: number;
  collBr: string;
  submsnBrId: number;
  submsnBr: string;
  blngBrId: number;
  blngBr: string;
  bkgBrId: number;
  altCollBr: string;
  sfxId: number;
  sfxCode: string;
  rateCardCode: string;
  outstandingAmt: number;
  actualoutstandingAmt: number;
  billingLevel: string;
  billingLevelCode: string;
  billToAddrLine1: string;
  billToAddrLine2: string;
  billToAddrLine3: string;
  billToCity: string;
  billToState: string;
  billToLocation: string;
  billToPincode: string;
  blngBrGst: string;
  blngBrAddr: string;
  blngBrLocation: string;
  blngBrCity: string;
  blngBrState: string;
  blngBrPincode: string;
  ebillFlag: string;
  email: string;
  paidToPayStatus: string;
  waybills: WaybillMinModel[];
}


export interface WaybillMinModel {
  waybillId: number; // Used only for credit get api
  waybillNum: number; // Used only for credit get api
  outstandingAmount: number; // Used only for credit get api
  billId: number;
  billNum: string;
  billType: string;
  amount: number;
  ttlTaxAmt: number;
  cgstAmt: number;
  igstAmt: number;
  sgstAmt: number;
}
