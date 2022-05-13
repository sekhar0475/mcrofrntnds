import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { BillBranchData } from '../models/update-bill-branch.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateBillBranchService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  // Bill Branch details based on bill type
  getBillBranches(billnumbers: string, billType: string) {
    let url = null;
    let params1 = null;
    if (billType === 'CREDIT') {
      url = this._constants.GET_POST_UPDATE_CREDIT_BILL_BRANCH;
      // request paramters
      params1 = new HttpParams()
        .append('billnumbers', billnumbers);
    } else if (billType === 'ALLIED_CREDIT_BILL' || billType === 'ALLIED_RETAIL_BILL') {
      url = this._constants.GET_POST_UPDATE_ALLIED_BILL_BRANCH;
      // request paramters
      params1 = new HttpParams()
        .append('billnumbers', billnumbers)
        .append('billType', billType);
    } else if (billType === 'WMS') {
      url = this._constants.GET_POST_UPDATE_WMS_BILL_BRANCH;
      // request paramters
      params1 = new HttpParams()
        .append('billnumbers', billnumbers);
    }
    console.log(url);
    return (this._client.get<BillBranchData[]>(url, { params: params1 }));
  }

  postBillBranchData(billBranchData: BillBranchData[], billType: string) {
    let url = null;
    if (billType === 'CREDIT') {
      url = this._constants.GET_POST_UPDATE_CREDIT_BILL_BRANCH;
    } else if (billType === 'ALLIED_CREDIT_BILL' || billType === 'ALLIED_RETAIL_BILL') {
      url = this._constants.GET_POST_UPDATE_ALLIED_BILL_BRANCH;
    } else if (billType === 'WMS') {
      url = this._constants.GET_POST_UPDATE_WMS_BILL_BRANCH;
    }
    return this._client.post<any>(url, billBranchData, { responseType: 'text' as 'json' });
  }

}


