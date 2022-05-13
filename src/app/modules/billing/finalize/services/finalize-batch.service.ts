import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Finalize } from '../models/finalize.model';
import { Observable } from 'rxjs';
import { ReportDetail } from '../models/batch-detail-report.model';
import { FinalizeBatch } from '../models/finalize-batch.model';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';

@Injectable({
  providedIn: 'root'
})
export class FinalizeBatchService {

  constructor(private _client: HttpClient
            , private _constants: ConstantsService) { }

  // to get all Bill Batch who's status is in pending finalization
  getFinalizeData(fromDate: string, toDate: string, batchNumber: string): Observable<Finalize[]> {

    // request paramters
    const params1 = new HttpHeaders()
      .set('fromdate', fromDate)
      .set('todate', toDate)
      .set('batchnumber', batchNumber);
    const url = this._constants.GET_BILL_FINALIZE;
    return this._client.get<Finalize[]>(url, { headers: params1 });
  }

  // get Bill Batch Details by batch Id
  getBatchDetails(batchId: number) {
    const url = this._constants.GET_BILL_FINALIZE_BY_ID;
    return this._client.get<ReportDetail[]>(url + batchId);
  }

  // put batches on finalized status
  postFinalizedData(finalizedData: FinalizeBatch[]) {
    const url = this._constants.POST_FINALIZE_BILL;
    return this._client.post<any>(url, finalizedData, { responseType: 'text' as 'json' });
  }

}


