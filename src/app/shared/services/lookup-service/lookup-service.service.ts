import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from '../constant-service/constants.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private _client: HttpClient
            , private _constants: ConstantsService) { }

  // lookup value
  getLookupValuesByType(lookupType: any) {
    const url = this._constants.GET_LOOKUP_SERVICE;
    return (this._client.get<any>(url + lookupType));
  }
  
  public getBranchData(branchId : number): Observable<any> {
    return (this._client.get<any>(`${this._constants.GET_WMS_BRANCH}`+ branchId));
  }

}
