import { AlliedBillRequest } from './../models/allied-bill-request.model';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BillDetailResponseDto } from '../models/bill-detail-response-dto.model';
import { WaybillRequest } from '../models/waybill-request.model';
import { Observable } from 'rxjs';
import { WaybillResponse } from '../models/waybill-response.model';
import { BillingLevelRequest } from '../models/billing-level-request.model';
import { BillWaybillResponse } from '../models/bill-waybill-response.model';

@Injectable({
  providedIn: 'root'
})
export class AlliedBillingService {

  constructor(private _client: HttpClient,
    private _constants: ConstantsService) { }


  getDocDetailsByDocNumber(docNumber: string ) {
    const url = this._constants.GET_CREDIT_BILLS_BY_DOC_NUMBER;
    const params = new HttpHeaders()
    .set('documentnumber', docNumber);
    return (this._client.get<BillDetailResponseDto[]>(url, {headers: params}));
  }

  getAllBranches() {
    //const url = this._constants.GET_ALL_BOOKING_BRANCH;
    const url = this._constants.API_URL + 'admin/common/branch/';
    return (this._client.get<any>(url));
  }

  postAlliedBill(reqData: AlliedBillRequest) {
    if(reqData.billType === 'ALLIED_RETAIL_BILL'){
      var url = this._constants.POST_ALLIED_RETAIL_BILLS;
    }else{
      var url = this._constants.POST_ALLIED_BILLS;
    }
    //const url = 'http://localhost:8080/allied/alliedBill'
    return (this._client.post(url, reqData,{ observe: 'response', responseType: 'text' })).toPromise();
  }

  getRetailBillDetailsByDocNumber(docNumber: string ) {
    const url = this._constants.GET_RETAIL_BILLS_BY_DOC_NUMBER;
    //const url = "http://9fd1f2f0-billing-nginxingr-06f5-794610346.ap-south-1.elb.amazonaws.com/retail/retail/billsByNumber";
    const params = new HttpHeaders()
    .set('documentnumber', docNumber);
    return (this._client.get<BillDetailResponseDto[]>(url, {headers: params}));
  }

  postValidateWaybillNumbers(reqData: WaybillRequest): Observable<any>{
    const url = this._constants.POST_VALIDATE_WAYBILL_NUMBERS;
    //const url = 'http://localhost:8081/billCommonBff/allied/credit/waybillNumber/valdtn'
    return (this._client.post<WaybillResponse>(url, reqData));
  }

  getPrcCustByPrcCode(prcCode : string) {
    const url = this._constants.GET_VALIDATE_PRC_CUST+"/"+prcCode;
    return (this._client.get<any>(url));
  }

  postGetCustByBillingLvl(reqData: BillingLevelRequest): Observable<any>{
    const url = this._constants.POST_FETCH_CUST_BY_BILL_LVL;
    return (this._client.post<WaybillResponse>(url, reqData));
  }

  postValidateBillWaybillNumbers(reqData: WaybillRequest): Observable<any>{
    const url = this._constants.POST_VALIDATE_BILL_WAYBILL_NUMBERS;
    return (this._client.post<BillWaybillResponse>(url, reqData));
  }
  getPincodeDetailsByPincode(pincode : string) {
    const url = this._constants.GET_PINCODE_VALIDATE+"/"+pincode;
    return (this._client.get<any>(url));
  }

  getBranchDetailsByBranchId(branchId : number) {
    const url = this._constants.API_URL + 'admin/common/branch/br/'+branchId;
    return (this._client.get<any>(url));

  }

}
