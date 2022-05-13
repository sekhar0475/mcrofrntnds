import { CMDMSearchResultLine } from './CMDMSearchResultLine';

export interface CMDMBillModelRequest {
  billingLevelId: number;
  billType: string;
  documentSubType: string;
  custId: number;
  customerName: string;
  branchId: number;
  billingLevel: string;
  billingLevelCode: string;
  errorMessage: string;
  gstNum: string;
  billToAddr: string;
  billToCity: string;
  billToState: string;
  billToAddrLine1: string;
  billToAddrLine2: string;
  billToAddrLine3: string;
  billToLocation: string;
  billToPincode: string;
  blngBrGst: string;
  blngBrAddr: string;
  blngBrCity: string;
  blngBrLocation: string;
  blngBrState: string;
  ebillFlag: string;
  email: string;
  custMsaCode: string;
  sfxCode: string;
  rateCardCode: string;
  cmdmBillLines: CMDMSearchResultLine[];
}
