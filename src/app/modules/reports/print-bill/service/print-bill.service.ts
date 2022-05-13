import { Injectable } from '@angular/core';
import { PrintSearchRequest } from '../models/print-search-request.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { PrintSearchResult } from '../models/print-search-result.model';
import { Observable } from 'rxjs';
import { PrintBillRequest } from '../models/print-bill-request.model';
import { SubmittedJobReponse } from '../models/report-job-reponse.model';

@Injectable({
  providedIn: 'root'
})
export class PrintBillService {
  http: any;

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }

  // get bills details
  getBillsData(searchRequest: PrintSearchRequest) {
    const url = this._constants.POST_GET_REPORT_PRINT_BILLS;
    return (this._client.post<PrintSearchResult[]>(url, searchRequest, { observe: 'response' }));

  }

  // submit job
  printSelectedBill(selected: PrintBillRequest[]): Observable<SubmittedJobReponse> {
    const url = this._constants.POST_REPORT_PRINT;
    return (this._client.post<SubmittedJobReponse>(url, selected));
  }
  // submit job
  printSelectedBillWithFormat(selected: PrintBillRequest[], isLongOps: boolean, selectedFormat: boolean): Observable<any> {

    const headerDict = {
      'islongops': isLongOps ? 'true': 'false',
      'checkifprint': selectedFormat ? 'true': 'false'
    }
    //new URL 
    const url = this._constants.GET_BILL_REPORT;

    return (this._client.post(url, selected, {headers: new HttpHeaders(headerDict), observe: 'response', responseType: 'arraybuffer'}));
  }

}
