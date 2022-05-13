import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { WaybillRequest } from '../../doc-search-upload/models/waybill-Search.model';
import { DocumentWriteOff } from '../../invoice-receipt-waybill-result/models/document-data.model';
import { UploadResult } from '../../invoice-receipt-waybill-result/models/upload-data.model';
import { WaybillWriteOff } from '../../invoice-receipt-waybill-result/models/waybill-writeoff.model';
import { WmsAlliedWriteOff } from '../../invoice-receipt-waybill-result/models/wms-allied-writeoff.model';

@Injectable({
  providedIn: 'root'
})
export class WaybillWriteOffService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  // to get way bills from propel-i (Booking)
  getWayBillForWriteOff(fromDate: string, toDate: string, documentNumber: string, brnachId: number, docType: string) {
    const waybillRequest: WaybillRequest = {
      docbranchid: brnachId,
      documentType: docType,
      documentnumber: documentNumber,
      fromdate: fromDate,
      todate: toDate
    };
    console.log(waybillRequest);
    const url = this._constants.GET_DOC_DEVIATION_WAYBILLS;
    return this._client.post<DocumentWriteOff[]>(url, waybillRequest);
  }

  // to get allied reatil bill for write off in Billing
  getAlliedRetailWayBillData(
    fromDate: string, toDate: string, documentNumber: string, brnachId: number, wayBillType: string,
    documentType: string) {
    let url = null;
    const params1 = new HttpHeaders()
      .set('fromdate', fromDate)
      .set('todate', toDate)
      .set('documentnumber', documentNumber)
      .set('docbranchid', brnachId.toString())
      .set('documenttype', documentType);
    if (documentType === 'ALLIED_RETAIL_BILL') {
      url = this._constants.GET_POST_ALLIED_WRITEOFF;
    }
    return (this._client.get<DocumentWriteOff[]>(url, { headers: params1 }));
  }

  // validate excel upload from propel-i
  postValidateWaybills(wayBillWriteoffData: UploadResult[], branchId: number, docType: StringMap) {
    const url = this._constants.POST_VALIDATE_WAYBILLS + 'waybillWriteOff/' + docType + '/getWayBills/';
    return this._client.post<UploadResult[]>(url + branchId, wayBillWriteoffData);
  }
  // post write off amt to propel-i
  postWayBillWriteOff(writeOffReq: WaybillWriteOff[]) {
    const url = this._constants.POST_WAYBILL_WRITEOFF;
    return this._client.post<any>(url, writeOffReq, { responseType: 'text' as 'json' });
  }

  // Save write off Data of ALLIED RETAL in Billing
  postAlliedRetailWriteOfData(invoiceWriteOffData: WmsAlliedWriteOff[], docType: string) {
    let url = null;
    if (docType === 'ALLIED_RETAIL_BILL') {
      url = this._constants.GET_POST_ALLIED_WRITEOFF;
    }
    return this._client.post<any>(url, invoiceWriteOffData, { responseType: 'text' as 'json' });
  }

  // validate excel data for Allied Retail Case in Billing
  postBulkUploadForAlliedRetailWriteOff(wayBillWriteOffData: UploadResult[], docType: string, docBranchId: string) {
    let url = null;
    if (docType === 'ALLIED_RETAIL_BILL') {
      url = this._constants.POST_INV_ALLIED_WRITEOFF;
    }
    return this._client.post<UploadResult[]>(url + docBranchId, wayBillWriteOffData);
  }

}
