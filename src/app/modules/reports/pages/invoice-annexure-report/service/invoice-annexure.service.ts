import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { SubmittedJobReponse } from '../../../print-bill/models/report-job-reponse.model';
import { ReportAnnexureRequest } from '../model/report-annexure-request.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceAnnexureService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService
  ) { }


  // get Job Status Lookup values
  getBillTypeValues() {
    const lookupType = 'BILLING_INVOICE_ANNEXURE_BILL_TYPE';
    return this.getLookupValues(lookupType);
  }

  // get lookup values from propel-i
  getLookupValues(lookupType: string) {
    const url = this._constants.GET_LOOKUP_SERVICE + lookupType;
    return this._client.get(url);
  }

  // to generate invoiceAnnexure report
  generateReport(ReportRequest: ReportAnnexureRequest): Observable<SubmittedJobReponse> {
    const url = this._constants.API_URL + 'reports/invoiceAnnexure/bill/v1/report/generate'
    return (this._client.post<SubmittedJobReponse>(url, ReportRequest));
  }
}
