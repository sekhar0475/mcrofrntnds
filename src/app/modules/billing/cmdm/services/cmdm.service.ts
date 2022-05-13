import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CMDMBillModelRequest } from '../models/CMDMBillModelRequest';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { WaybillModel, WaybillSearchRequest } from '../models/WaybillSearchModels';
import { BillDetailResponse } from '../models/BillDetailModels';

@Injectable({
  providedIn: 'root'
})
export class CmdmService {

  // Need to get from service
  createdAgainsts = ['GST Invoice', 'Waybill'];

  constructor(
    private httpClient: HttpClient,
    private _constants: ConstantsService) { }

  getCreatedAgainsts() {
    return this.createdAgainsts;
  }

  getDocumentTypes() {
    const lookupType = 'CMDM_DOCUMENT_TYPE';
    return this.getLookupValues(lookupType);
  }

  getDocumentWises() {
    const lookupType = 'CMDM_DOCUMENT_WISE';
    return this.getLookupValues(lookupType);
  }

  getCMLineReason() {
    const lookupType = 'CM_LINE_REASON';
    return this.getLookupValues(lookupType);
  }

  getDMLineReason() {
    const lookupType = 'DM_LINE_REASON';
    return this.getLookupValues(lookupType);
  }

  getLookupValues(lookupType: string) {
    const url = this._constants.GET_LOOKUP_SERVICE + lookupType;
    return this.httpClient.get(url);
  }

  postCMDMBill(cmdmBillModelRequest: CMDMBillModelRequest, documentSubType: string) {
    const url = this._constants.CMDM_BILL + documentSubType + '/cmdm/create';
    return this.httpClient.post(url, cmdmBillModelRequest, { observe: 'response', responseType: 'text' });
  }

  uploadAndValidate(selectedFile, documentSubType: string, documentNumbers: string, isCreditNote: string) {
    const url = this._constants.CMDM_BILL + documentSubType + this._constants.CMDM_BULK_UPLOAD;
    const uploadFormData = new FormData();
    console.log(documentNumbers);
    console.log(isCreditNote);
    uploadFormData.append('file', selectedFile, selectedFile.name);
    // uploadFormData.append('documentNumber', documentNumbers);
    uploadFormData.append('isCreditNote', isCreditNote);
    return this.httpClient.put<CMDMBillModelRequest>(url, uploadFormData, { observe: 'response' });
  }

  downloadBulkUploadTemplate(documentSubType: string) {
    const url = this._constants.CMDM_BILL + documentSubType + this._constants.CMDM_BULK_UPLOAD;
    return this.httpClient.get(url, { observe: 'response', responseType: 'text' });
  }

  getCreditBillsByDocumentNumber(documentNumbers: string, documentWise: string) {
    const url = this._constants.CMDM_GET_CREDIT_BILLS;
    const params = new HttpHeaders()
      .set('documentnumber', documentNumbers)
      .set('documentwise', documentWise)
      .set('samebillinglevel', true.toString());
    return this.httpClient.get<BillDetailResponse[]>(url, { headers: params, observe: 'response' });
  }

  getRetailBillsByDocumentNumber(documentNumbers: string, documentWise: string) {
    const url = this._constants.CMDM_GET_RETAIL_BILLS;
    const params = new HttpHeaders()
      .set('documentnumber', documentNumbers)
      .set('documentwise', documentWise)
      .set('samebillinglevel', true.toString());
    return this.httpClient.get<BillDetailResponse[]>(url, { headers: params, observe: 'response' });
  }

  // Get WMS Bills
  getWMSBillsBy(documentNumbers: string, sameBillingLevel: boolean) {
    const url = this._constants.CMDM_GET_WMS_BILLS;
    const params = new HttpHeaders()
      .set('documentnumber', documentNumbers)
      .set('samebillinglevel', sameBillingLevel.toString());

    return this.httpClient.get<BillDetailResponse[]>(url, { headers: params, observe: 'response' });
  }

  getAlliedBillsBy(documentNumbers: string, documentWise: string, sameBillingLevel: boolean) {
    const url = this._constants.CMDM_GET_ALLIED_BILLS;

    const createdAgainst = 'BILL';
    
    const params = new HttpHeaders()
      .set('createdAgainst', createdAgainst)
      .set('documentNumber', documentNumbers)
      .set('documentWise', documentWise)
      .set('samebillinglevel', sameBillingLevel.toString());

    return this.httpClient.get<BillDetailResponse[]>(url, { headers: params, observe: 'response' });
  }

  // TODO: Add in seprate service or maybe shared service
  getWaybillsDetails(waybillNumbers: string) {
    const waybillRequest: WaybillSearchRequest = { 'documentnumber': waybillNumbers };
    const url = this._constants.CMDM_GET_WAYBILLS;
    return this.httpClient.post<WaybillModel[]>(url, waybillRequest, { observe: 'response' });
  }

 // branch Detail by brnach id
  getBranchById(brId: number){
    const url = this._constants.GET_BOOKING_BRANCH + 'br/';
    return (this.httpClient.get(url + brId));
  }

}
