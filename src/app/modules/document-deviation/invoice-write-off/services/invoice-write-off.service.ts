import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { CreditWriteOff } from '../../invoice-receipt-waybill-result/models/credit-writeoff.model';
import { DocumentWriteOff } from '../../invoice-receipt-waybill-result/models/document-data.model';
import { UploadResult } from '../../invoice-receipt-waybill-result/models/upload-data.model';
import { WmsAlliedWriteOff } from '../../invoice-receipt-waybill-result/models/wms-allied-writeoff.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceWriteOffService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  getInvoiceData(fromDt: string, toDt: string, documentNum: string, branchId: string, docType: string) {
    // request paramters
    let url = null;
    let params1 = null;
    if (docType === 'ALLIED_CREDIT_BILL') {
      params1 = new HttpHeaders()
        .set('fromdate', fromDt)
        .set('todate', toDt)
        .set('documentnumber', documentNum)
        .set('docbranchid', branchId)
        .set('documenttype', docType);
    } else {
      params1 = new HttpHeaders()
        .set('fromdate', fromDt)
        .set('todate', toDt)
        .set('documentnumber', documentNum)
        .set('docbranchid', branchId);
    }

    if (docType === 'CREDIT') {
      url = this._constants.GET_POST_CREDIT_WRITEOFF;
    } else if (docType === 'ALLIED_CREDIT_BILL') {
      url = this._constants.GET_POST_ALLIED_WRITEOFF;
    } else if (docType === 'WMS') {
      url = this._constants.GET_POST_WMS_WRITEOFF;
    }
    return (this._client.get<DocumentWriteOff[]>(url, { headers: params1 }));
  }

  // credit write of API
  postCreditWriteOfData(invoiceWriteOffData: CreditWriteOff[], docType: string) {
    let url = null;
    if (docType === 'CREDIT') {
      url = this._constants.GET_POST_CREDIT_WRITEOFF;
    }
    return this._client.post<any>(url, invoiceWriteOffData, { responseType: 'text' as 'json' });
  }

  // Allied credit and Wms Bills write off
  postWmsAlliedWriteOfData(invoiceWriteOffData: WmsAlliedWriteOff[], docType: string) {
    let url = null;
    if (docType === 'ALLIED_CREDIT_BILL') {
      url = this._constants.GET_POST_ALLIED_WRITEOFF;
    } else if (docType === 'WMS') {
      url = this._constants.GET_POST_WMS_WRITEOFF;
    }
    return this._client.post<any>(url, invoiceWriteOffData, { responseType: 'text' as 'json' });
  }



  // excel upload data
  postBulkUploadForInvWriteOff(invoiceWriteOffData: UploadResult[], docType: string, docBranchId: string) {
    let url = null;
    if (docType === 'CREDIT') {
      url = this._constants.POST_INV_CREDIT_WRITEOFF;
    } else if (docType === 'ALLIED_CREDIT_BILL') {
      url = this._constants.POST_INV_ALLIED_WRITEOFF;
    } else if (docType === 'WMS') {
      url = this._constants.POST_INV_WMS_WRITEOFF;
    }
    return this._client.post<UploadResult[]>(url + docBranchId, invoiceWriteOffData);
  }
  // for tamplate
  downloadBulkUploadTemplate() {
    const url = this._constants.GET_BULK_UPLOAD_TEMPLATE;
    return this._client.get(url, { observe: 'response', responseType: 'text' }).toPromise();
  }
}
