import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { authResponse } from '../models/stateCodeResponse/auth-response.model';
import { EInvoiceSearchResponse } from '../models/search-response.model';
import { stateCodeResponse } from '../models/stateCodeResponse/stateCode-reponse.model';
import { editRequest } from '../models/edit-request.model';
import { UploadEinvResult } from '../models/upload-einv-result.model';

@Injectable({
  providedIn: 'root'
})

export class EinvoiceService {

  constructor(
    private _httpClient: HttpClient,
    private _constants: ConstantsService
  ) { }

  current_data: EInvoiceSearchResponse = {} as EInvoiceSearchResponse;
  documentType: string;
  authorization: authResponse;
  editRequest: editRequest

  getStatusValues() {
    const lookupType = 'BILLING_EINV_STATUS';
    return this.getLookupValues(lookupType);
  }


  getLookupValues(lookupType: string) {
    const url = this._constants.GET_LOOKUP_SERVICE + lookupType;
    return this._httpClient.get(url);
  }


  //for wms einvoices
  getWmsEinvoices(docNum: string, buyerGstin: string, status: string, convertedFromDate: string, convertedToDate: string) {

    let newBuyerGstin = buyerGstin;
    let newDocNum = docNum;

    const headerDict = {
      'documentNumber': newDocNum,
      'fromDate': convertedFromDate,
      'toDate': convertedToDate,
      'buyerGstin': newBuyerGstin,
      'status': status,
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let url = this._constants.GET_POST_EINVOICE_WMS;
    return this._httpClient.get<EInvoiceSearchResponse[]>(url, requestOptions);
  }

  //for credit Einvoices
  getCreditEinvoices(docNum: string, buyerGstin: string, status: string, batchNumber: string, convertedFromDate: string, convertedToDate: string) {

    let newBuyerGstin = buyerGstin;
    let newDocNum = docNum;

    const headerDict = {
      'documentNumber': newDocNum,
      'fromDate': convertedFromDate,
      'toDate': convertedToDate,
      'buyerGstin': newBuyerGstin,
      'status': status,
      'batchNumber': batchNumber,
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    // GET_POST_EINVOICE_CREDIT
    let url = this._constants.GET_POST_EINVOICE_CREDIT;
    return this._httpClient.get<EInvoiceSearchResponse[]>(url, requestOptions);
  }

  getCmdmEinvoices(docNum: string, buyerGstin: string, status: string, convertedFromDate: string, convertedToDate: string) {

    let newBuyerGstin = buyerGstin;
    let newDocNum = docNum;

    const headerDict = {
      'documentNumber': newDocNum,
      'fromDate': convertedFromDate,
      'toDate': convertedToDate,
      'buyerGstin': newBuyerGstin,
      'status': status,
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let url = this._constants.GET_POST_EINVOICE_CMDM;
    return this._httpClient.get<EInvoiceSearchResponse[]>(url, requestOptions);
  }

  getRetailBulkUrl(uploadData: UploadEinvResult[]){
    let url = this._constants.API_URL+'retail/einvoice/bulk';
    return this._httpClient.post<EInvoiceSearchResponse[]>(url, uploadData);
  }

  postRetailBulk(editRequest: editRequest[]){
    let url = this._constants.API_URL+'retail/einvoice';
    return this._httpClient.post<EInvoiceSearchResponse[]>(url, editRequest,{ responseType: 'text' as 'json' });
  }

  getRetailUrl(docNum: string, buyerGstin: string, status: string, convertedFromDate: string, convertedToDate: string) {

    let newBuyerGstin = buyerGstin;
    let newDocNum = docNum;

    const headerDict = {
      'documentNumber': newDocNum,
      'fromDate': convertedFromDate,
      'toDate': convertedToDate,
      'buyerGstin': newBuyerGstin,
      'status': status,
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let url = this._constants.API_URL+'retail/einvoice';
    console.log('getRetailUrl : '+url);
    return this._httpClient.get<EInvoiceSearchResponse[]>(url, requestOptions);
  }

  getAlliedEinvoices(docNum: string, buyerGstin: string, status: string, convertedFromDate: string, convertedToDate: string) {

    let newBuyerGstin = buyerGstin;
    let newDocNum = docNum;

    const headerDict = {
      'documentNumber': newDocNum,
      'fromDate': convertedFromDate,
      'toDate': convertedToDate,
      'buyerGstin': newBuyerGstin,
      'status': status,
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let url = this._constants.GET_POST_EINVOICE_ALLIED;
    return this._httpClient.get<EInvoiceSearchResponse[]>(url, requestOptions);
  }

  //service for finding state code
  setStateCode(pinCode: string) {
    let url = this._constants.GET_BOOKING_BRANCH + 'pincode/';
    return this._httpClient.get<stateCodeResponse>(url + `${pinCode}`);
  }

  //update Einvoice
  updateCreditEinvoice(editRequest: editRequest) {
    // const header = {
    //   headers: new HttpHeaders({'UserName': 'USER1'})
    // }
    let url = this._constants.GET_POST_EINVOICE_CREDIT;
    return this._httpClient.post<string>(url,editRequest, { responseType: 'text' as 'json' });
  }

  updateWmsEinvoice(editRequest: editRequest) {
    // const header = {
    //   headers: new HttpHeaders({'UserName': 'USER1'})
    // }
    let url = this._constants.GET_POST_EINVOICE_WMS;
    return this._httpClient.post<string>(url,editRequest, { responseType: 'text' as 'json' });
  }
  
  updateCmdmEinvoice(editRequest: editRequest) {
    let url = this._constants.GET_POST_EINVOICE_CMDM;
    return this._httpClient.post<string>(url,editRequest, { responseType: 'text' as 'json' });
  }
  
  updateAlliedEinvoice(editRequest: editRequest) {

    let url = this._constants.GET_POST_EINVOICE_ALLIED;
    return this._httpClient.post<string>(url,editRequest, { responseType: 'text' as 'json' });
  }

  // for template
  downloadBulkUploadTemplate() {
    const url = this._constants.API_URL+'retail/einvoice/template';
    return this._httpClient.get(url, { observe: 'response', responseType: 'text' }).toPromise();
  }
}
