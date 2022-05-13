import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ReceiptSummary } from '../models/receiptSummary.model';
import { ReceiptDetailsWithId } from '../models/receiptDetailsById.model';
import { Receipt } from '../models/receipt.model';
import { Observable } from 'rxjs';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { BillDetails } from '../models/BillDetails.model';
import { ReceiptApplication } from '../models/receiptApplication.model';
import { AppliedReceipt } from '../models/appliedReceipt.model';


@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor(private client: HttpClient,
              private constants: ConstantsService) { }

  // get Rececipt Data Summary
  getReceiptData(applyFlag: boolean, fromDate: string, toDate: string, receiptNumber: string) {
    // request paramters
    const params = new HttpHeaders()
      .set('applyUnapply', applyFlag.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('receiptNumber', receiptNumber);
    const url = (applyFlag ? this.constants.GET_UNAPPLY_RECEIPTS : this.constants.GET_APPLY_RECEIPTS);
    return (this.client.get<ReceiptSummary[]>(url, { headers: params }));
  }

  // get Receipt Data by Receipt ID
  getReceiptDataById(receiptId: number, unapplicationFlag: boolean) {
    const url = unapplicationFlag ? this.constants.GET_APPLY_RECEIPT_ID : this.constants.GET_UNAPPLY_RECEIPT_ID;
    return (this.client.get<ReceiptDetailsWithId>(url + receiptId));
  }

  // Post data into Data base to create receipt
  postReceipts(reqData: Receipt): Observable<Receipt[]> {
    const url = this.constants.POST_RECEIPTS;
    return (this.client.post<Receipt[]>(url, reqData));
  }

  // get bill documents
  getBillData(documentType: string, documentNumber: string, custId: string,
              fromDate: string, toDate: string) {
    let url = this.constants.GET_BILLS;
    if (documentType.includes('DEBIT')) {
      url = this.constants.API_URL + 'receipt/application/bills/dm';
    } else {
      url = this.constants.GET_BILLS;
    }
    const params = new HttpHeaders()
     .set('documentType', documentType)
     .set('documentNumber', documentNumber)
      .set('custId', custId)
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    return this.client.get<BillDetails[]>(url, { headers: params });
  }
  // receipt application
  postReceiptApplication(applData: ReceiptApplication[]) {
    const url = this.constants.POST_RECEIPT_APPLY;
    return this.client.post<any>(url, applData, { responseType: 'text' as 'json' });
  }

  // get applied receipt by id
  getAppliedReceipts(receiptId: number) {
    const url = this.constants.GET_APPLIED_REPT;
    return this.client.get<AppliedReceipt[]>(url + receiptId);
  }

  // receipt unaply
  postReceiptUnapply(unApplnData: ReceiptApplication[]) {
    const url = this.constants.POST_RECEIPT_UNAPPLY;
    return this.client.post<any>(url, unApplnData, { responseType: 'text' as 'json' });
  }

  // get lookup
  getLookupValuesByType(lookupType) {
    const url = this.constants.GET_LOOKUP_SERVICE;
    return (this.client.get<any>(url + lookupType));
  }

  // get customer
  getCreditCustomer(type) {
    const url = this.constants.API_URL + 'admin/common/customer/credit/receipt';
    // request paramters
    const params = new HttpHeaders()
      .set('customerType', type);
    return (this.client.get<any>(url));
  }

  // get allied retail non-prc customers
  getAlliedNonPrcCustomer() {
    const url = this.constants.API_URL + 'admin/common/customer/allied/nonprc';
    return (this.client.get<any>(url));
  }
  // get retail customer
  getRetailCustomer(type) {
    const url = this.constants.API_URL + 'admin/common/customer/retail/receipt/' + type;
    return (this.client.get<any>(url));
  }

  // get branch details.
  getBranchBankAccount() {
    const url = this.constants.API_URL + 'receipt/generation/branch';
    return (this.client.get<any>(url));
  }

  // upload attachments.
  onUpload(selectedFile: File, fileName) {
    const url = this.constants.API_URL + 'receipt/generation/uploadFile';
    // FormData API provides methods and properties to allow us easily prepare form data to be sent with POST HTTP requests.
    const uploadImageData = new FormData();
    uploadImageData.append('file', selectedFile);
    uploadImageData.append('fileName', fileName);
    // Make a call to the Spring Boot Application to save the image
    return this.client.post(url, uploadImageData, { observe: 'response', responseType: 'text' });
  }

}
