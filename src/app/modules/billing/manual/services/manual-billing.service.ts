import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { CustomerSearchResponseDto } from '../models/customer-search-response-dto.model';
import { ManualCustomerResponse } from '../models/cutomer-response.model';

@Injectable({
  providedIn: 'root'
})
export class ManualBillingService {

  constructor(private _client: HttpClient,
    private _constants: ConstantsService) { }

  // to get the customer data for manual batch creation
  getEligibleContracts(type: string, blngLvl: string, blngCyl: string,
    custName: string, msa: string, sfx: string, autoBilFlg: string, pageNumber: string, dataSize: string) {

    const url = this._constants.GET_MANUAL_CUSTOMER;

    const params = new HttpHeaders()
      .set('type', type)
      .set('billinglevel', blngLvl)
      .set('billingcycle', blngCyl)
      .set('customername', custName)
      .set('msacode', msa)
      .set('sfxcode', sfx)
      .set('autobillflag', autoBilFlg)
      .set('pageNumber', pageNumber)
      .set('dataSize', dataSize);

    return (this._client.get<CustomerSearchResponseDto[]>(url, { headers: params }));
  }


  // to create batches in the backend..
  postSelectedCustomer(selectedCustomers: CustomerSearchResponseDto[]) {
    const url = this._constants.POST_MANUAL_BATCH;
    return (this._client.post<any>(url, selectedCustomers, { responseType: 'text' as 'json' }));
  }


  // to get the customer data for manual batch creation
  getManualEligibleContracts(type: string, blngLvl: string, blngCyl: string,
    custName: string, msa: string, sfx: string, autoBilFlg: string, pageNumber: string, dataSize: string) {

    const url = this._constants.GET_MANUAL_CUSTOMER_NEW;

    const params = new HttpHeaders()
      .set('type', type)
      .set('billinglevel', blngLvl)
      .set('billingcycle', blngCyl)
      .set('customername', custName)
      .set('msacode', msa)
      .set('sfxcode', sfx)
      .set('autobillflag', autoBilFlg)
      .set('pageNumber', pageNumber)
      .set('dataSize', dataSize);

    return (this._client.get<ManualCustomerResponse[]>(url, { headers: params }));
  }


  // to create batches in the backend..
  postBatchCreation(selectedCustomers: ManualCustomerResponse[]) {
    const url = this._constants.POST_MANUAL_BATCH_NEW;
    return (this._client.post<any>(url, selectedCustomers, { responseType: 'text' as 'json' }));
  }

}
