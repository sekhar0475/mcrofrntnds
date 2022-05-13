import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders} from '@angular/common/http';
import { AutoBillCustomer } from '../models/auto-bill-customer.model';
import { Hold } from '../models/hold.model';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';


@Injectable({
  providedIn: 'root'
})
export class HoldServiceService {

  constructor( private _client: HttpClient
             , private _constants: ConstantsService) { }

// get customer for hold
 getCustomerData(holdStatus: string , customerName: string , msa: string , sfxCode: string , custType: string,pageNum:string,datasize: string) {
   // request paramters
     const params = new HttpHeaders()
     .set('holdstatus', holdStatus)
     .set('customername', customerName)
     .set('msa', msa)
     .set('sfxcode', sfxCode)
     .set('type' , custType)
     .set('pagenumber' , pageNum)
     .set('datasize' , datasize);

     const url = this._constants.GET_CUSTOMER_HOLD;
     return (this._client.get<AutoBillCustomer[]>(url , { headers: params }));
  }

  // to post the data to data base
  postHoldData(holdData: Hold[]) {
    const url = this._constants.POST_CUSTOMER_HOLD;
    return (this._client.post<any>(url, holdData, {responseType: 'text' as 'json' }));
  }

}
