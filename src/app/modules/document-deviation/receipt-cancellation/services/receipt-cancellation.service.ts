import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { DocumentWriteOff } from '../../invoice-receipt-waybill-result/models/document-data.model';
import { ReceiptCancel } from '../../invoice-receipt-waybill-result/models/receipt-cancel.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptCancellationService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

    getReceiptCancelData(fromDt: string, toDt: string, documentNum: string, chequeNum: string , branchId: string) {
      // request paramters
      const params1 = new HttpHeaders()
        .set('fromdate', fromDt)
        .set('todate', toDt)
        .set('documentnumber', documentNum)
        .set('chequenumber', chequeNum)
        .set('docbranchid',  branchId);
      const url = this._constants.GET_POST_RECEIPT_CANCEL;
      return (this._client.get<DocumentWriteOff>(url, { headers: params1 }));
    }

     // save write of data in data base
  postReceiptCancelData(canceledRcpt: ReceiptCancel ) {
    const url = // `http://localhost:80/receipt/cancel`;
    this._constants.GET_POST_RECEIPT_CANCEL;
    return this._client.post<ReceiptCancel[]>(url, canceledRcpt);
  }

   // get branch details.
   getBranchBankAccount() {
    const url = this._constants.API_URL + 'receipt/generation/branch';
    return (this._client.get<any>(url));
  }

  // upload attachments.
  onUpload(selectedFile: File, fileName) {
    const url = this._constants.API_URL + 'receipt/generation/uploadFile';

    console.log(selectedFile.name);
    // FormData API provides methods and properties to allow us easily prepare form data to be sent with POST HTTP requests.
    const uploadImageData = new FormData();
    uploadImageData.append('file', selectedFile);
    uploadImageData.append('fileName', fileName);
    // Make a call to the Spring Boot Application to save the image
    return this._client.post(url, uploadImageData, { observe: 'response', responseType: 'text' });
  }

}
