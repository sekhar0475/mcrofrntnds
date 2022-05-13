import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { SubmittedJobReponse } from '../../../print-bill/models/report-job-reponse.model';
import { SubmitJobRequest } from '../model/report-job-submit-criteria.model';


@Injectable({
  providedIn: 'root'
})
export class CustomerLedgerService {
  http: any;

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  // get customer details by customer name
  getCustomerByName(customerName) {
    const url = this._constants.API_URL + 'reports/customerLedger/bill/customer/v1/search/'
    return (this._client.get<CustomerDetails[]>(url + customerName));
  }

  // to generate Customer ledger report report
  postReport(ReportRequest: SubmitJobRequest): Observable<SubmittedJobReponse> {
    const url = this._constants.API_URL + 'reports/customerLedger/bill/v1/report/generate'
    return (this._client.post<SubmittedJobReponse>(url, ReportRequest));
  }
}
