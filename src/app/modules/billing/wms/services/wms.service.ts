import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { SearchResult } from '../models/search-result.model';
import { WmsLines } from '../models/wms-lines.model';
import { WmsBillingSave } from '../models/wms-billing-save.model';
import { Observable } from 'rxjs';
import { LookupResponse } from '../models/lookup-response.model';
import { map } from 'rxjs/operators';
import { CustomerContract } from '../models/customer-contract.model';
import { CustByNameRequest } from '../models/cust-by-name-request.model';

@Injectable({
  providedIn: 'root'
})
export class WmsService {
  constructor(private client: HttpClient,
    private constants: ConstantsService) { }
  // get WMS Billing
  public getWmsBiling(custName, billBranch, billLevel, billLevelCode) {
    const headers = new HttpHeaders().append('header', 'value');
    const params = new HttpParams()
      .append('custName', custName)
      .append('billBranch', billBranch)
      .append('billLevel', billLevel).append('billLevelCode', billLevelCode);
    //this.http.get('url', {headers, params}); 
    return (this.client.get<SearchResult>(`${this.constants.GET_WMS_BILLING}`, { headers, params }));
  }

  // get WMS Billing Lines
  public getWmsBilingLines(billId: number) {
    return (this.client.get<WmsLines[]>(`${this.constants.GET_WMS_BILL_LINES}` + billId));
  }

  // Save WMS Billing Data
  public saveWmsBilling(wmsBillingSave: WmsBillingSave) {
    return (this.client.post<any>(`${this.constants.POST_WMS_BILLING}`, wmsBillingSave));
  }

  // get WMS Billing Lines
  // public getCustomerData(wmsParam) {
  //   return (this.client.get<any>(`${this.constants.API_URL_TEMP}`));
  // }

  public getCustomerData(customerContract : CustomerContract): Observable<any> {
    return (this.client.post<void>(`${this.constants.POST_PROPEL_CUSTOMER_API}`, customerContract));
  }

  // get WMS Billing Lines
  // get lookup
  public getLookupValuesByType(lookupType) {
    const url = this.constants.GET_LOOKUP_SERVICE;
    return (this.client.get<any>(url + lookupType));
  }

  public getCustomerByName(request : CustByNameRequest){
    return (this.client.post<any>(`${this.constants.GET_WMS_CUST_BY_NAME}`, request));
  }

}
