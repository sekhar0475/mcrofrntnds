import { ElementRef } from '@angular/core';

export interface CMDMSearchParam {
  fileInput: ElementRef;
  isBulkUpload: boolean;
  selectedFile: any;
  isCreditNote: boolean;
  isCredit: boolean;
  isWaybill: boolean;
  documentSubType: string;
  documentNumbers: string;
  createdAgainst: string;
  documentWise: string;
  documentType: string;
  waybillNumbers: string;
  documentAmount: string;
  billBranch: string;
  creditMemoDate: string;
}
