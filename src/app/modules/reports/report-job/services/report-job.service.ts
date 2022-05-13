import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { ReportJobRequest } from '../models/job-request.model';
import { ReportJobResponse } from '../models/job-response.model';
import { ReportResourceReponse } from '../models/report-output-resource.model';

@Injectable({
  providedIn: 'root'
})
export class ReportJobService {

  constructor(
    private _httpClient: HttpClient,
    private _constants: ConstantsService
  ) { }

  

  // get Job Status Lookup values
  getReportJobStatusValues() {
    const lookupType = 'BILLING_JOB_STATUS';
    return this.getLookupValues(lookupType);
  }

  // get lookup values from propel-i
  getLookupValues(lookupType: string) {
    const url = this._constants.GET_LOOKUP_SERVICE + lookupType;
    return this._httpClient.get(url);
  }

  // get submitted jobs
  getSubmittedJobsData(searchRequest: ReportJobRequest) {
    const url = this._constants.GET_REPORT_JOB_DETAILS_PRINT_BILL;
    return (this._httpClient.post<ReportJobResponse[]>(url, searchRequest));

  }

  // get report from AWS S3 by Job Id.
  getReportByJobId(jobId: string) {
    const params = new HttpParams()
      .set('jobId', jobId);
    const url = this._constants.GET_PRINT_BILL_REPORT_JOB_ID;
    return (this._httpClient.get<ReportResourceReponse>(url, { params: params }));
  }

}
