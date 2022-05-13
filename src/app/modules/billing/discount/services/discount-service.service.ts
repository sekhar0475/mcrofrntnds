import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { DiscountData } from '../models/discount.model';
import { Observable } from 'rxjs';
import { DiscountArry } from '../models/discount-array.model';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';

@Injectable({
  providedIn: 'root'
})
export class DiscountServiceService {

  constructor(private _client: HttpClient
            , private _constants: ConstantsService) { }

  // service to get the intial data for discount
  getDiscountData(batchNum: string , billNumbers: string): Observable<DiscountData[]> {
    // request parameters
    const params1 = new HttpHeaders()
    .set('batchnum' , batchNum)
    .set('billnumbers', billNumbers);
    const url = this._constants.GET_BILL_DISCOUNT;
    return this._client.get<DiscountData[]>(url, { headers: params1});
  }

  // to post data into database for selected bills
  postDiscountData(discountData: DiscountArry[]) {
    const url = this._constants.POST_BILL_DISCOUNT;
    return this._client.post<any>(url, discountData, { responseType: 'text' as 'json' });
  }

}
