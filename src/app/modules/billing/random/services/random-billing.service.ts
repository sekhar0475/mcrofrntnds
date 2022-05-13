import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { BillingLevelRequest } from '../../allied/models/billing-level-request.model';
import { WaybillResponse } from '../../allied/models/waybill-response.model';
import { RandomCreditCustomerDetails } from '../models/random-creditcust.model';
import { RandomCustRequest } from '../models/random-customer-request.model';
import { RandomSearchParam } from '../models/random-waybill-search-request.model';
import { RandomWaybillResponse } from '../models/random-waybills-response.model';

@Injectable({
  providedIn: 'root'
})
export class RandomBillingService {

  selectedBillingOptionsID: any;

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }


  // postGetCustByBillingLvl(reqData: BillingLevelRequest): Observable<any> {
  //   const url = this._constants.GET_RANDOM_CUST_DETAIL;
  //   return (this._client.post<WaybillResponse>(url, reqData));
  // }

  public postGetCustByBillingLvl(customerContract: RandomCustRequest): Observable<any> {
    const url = this._constants.GET_RANDOM_CUST_DETAILS;
    return (this._client.post<void>(url, customerContract));
  }

  getAllBranches() {
    //const url = this._constants.GET_ALL_BOOKING_BRANCH;
    const url = this._constants.API_URL + 'admin/common/branch/';
    return (this._client.get<any>(url));
  }


  // to get Random waybills 
  getRandomWaybills(reqData: RandomSearchParam): Observable<RandomWaybillResponse> {
    const url = this._constants.GET_RANDOM_WAYBILLS;
    return (this._client.post<RandomWaybillResponse>(url, reqData));

  }

  // to post Random API
  postRandomWaybills(reqData: RandomCreditCustomerDetails) {
    const url = this._constants.POST_RANDOM_WAYBILLS;
    return (this._client.post<string>(url, reqData));
  }

  getBranchDetailsByBranchId(branchId : number) {
    const url = this._constants.API_URL + 'admin/common/branch/br/'+branchId;
    return (this._client.get<any>(url));

  }
}
