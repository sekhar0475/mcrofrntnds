import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Review } from '../models/review.model';
import { Observable } from 'rxjs';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { CustomerData } from '../models/customer-data.model';
import { SearchWayBillByBatch } from '../models/search-waybill.model';
import { WayBillMainData } from '../models/way-bill-main-data.model';
import { RemoveWayBill } from '../models/remove-waybill.model';
import { ErrorReportModel } from '../models/error-batch-detail.model';
import { ReviewSearchParams } from '../models/review-search-params.model';


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  public searchParams: ReviewSearchParams = {} as ReviewSearchParams;

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  // to get all Bill Batch details for review
  getReviewData(batchTy: string, batchStatus: string, blngLevel: string, blngLevelCode: string, fromDt: string,
                toDt: string, batchNum: string): Observable<Review[]> {
    // request paramters
    const params1 = new HttpHeaders()
      .set('billbatchtype', batchTy)
      .set('batchstatus', batchStatus)
      .set('billinglevel', blngLevel)
      .set('billinglevelcode', blngLevelCode)
      .set('fromdate', fromDt)
      .set('todate', toDt)
      .set('batchnumber', batchNum);
    const url = this._constants.GET_REVIEW_BILL;
    return this._client.get<Review[]>(url, { headers: params1 });
  }

  // to create batches in the backend..
  postSelectedBatch(selectedBatch: Review[]) {
    const url = this._constants.POST_REVIEW_BATCH;
    return (this._client.post<any>(url, selectedBatch, { responseType: 'text' as 'json' }));
  }
  // get customer
  getBillingLevelforReview(billBatchId: number, billingLevelId: number, blngCode: string) {
    const url = this._constants.GET_BATCH_BLNG_LEVEL;
    console.log(billBatchId.toString(), billingLevelId.toString(), blngCode);
    const params1 = new HttpHeaders()
      .set('billbatchid', billBatchId.toString())
      .set('billinglevelid', billingLevelId.toString())
      .set('billinglevelcode', blngCode);
    return this._client.get<CustomerData[]>(url, { headers: params1 });
  }

  // get way bills
  getBatchReviewWayBills(wayBillReq: SearchWayBillByBatch) {
    const url = this._constants.GET_BATCH_REVIEW_WAYBILLS;
    return (this._client.post<WayBillMainData>(url, wayBillReq));
  }

  // get way bills
  postRejectedWayBillsorBatch(wayBillReq: RemoveWayBill[] , rejectionType: string): Observable<any> {
    const params1 = new HttpHeaders()
    .set('rejectiontype', rejectionType);
    const url = this._constants.POST_WAYBILLS_REJECT;
    return (this._client.post(url , wayBillReq , { headers: params1 ,  responseType: 'text'} ));
  }

   // get Bill Error Batch Details by batch Id
   getErrorBatchDetails(batchId: number) {
    const url = this._constants.GET_ERROR_BATCH_DETAIL_BY_BATCH_ID;
    return this._client.get<ErrorReportModel[]>(url + batchId);
  }
}
