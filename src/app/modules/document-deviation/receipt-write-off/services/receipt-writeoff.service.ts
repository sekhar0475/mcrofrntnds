import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { DocumentWriteOff } from '../../invoice-receipt-waybill-result/models/document-data.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptWriteoffService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  getReceiptWriteOfData(fromDt: string, toDt: string, documentNum: string, chequeNum: string , branchId: string) {
    // request paramters
    const params1 = new HttpHeaders()
      .set('fromdate', fromDt)
      .set('todate', toDt)
      .set('documentnumber', documentNum)
      .set('chequenumber', chequeNum)
      .set('docbranchid', branchId);
    const url = this._constants.GET_POST_RECEIPTS_WRITEOFF;
    return (this._client.get<DocumentWriteOff[]>(url, { headers: params1 }));
  }

  // save write of data in data base
  postReceiptWriteOfData(receiptWriteOffData: DocumentWriteOff[]) {
    const url = this._constants.GET_POST_RECEIPTS_WRITEOFF;
    return this._client.post<any>(url, receiptWriteOffData, { responseType: 'text' as 'json' });
  }
}
