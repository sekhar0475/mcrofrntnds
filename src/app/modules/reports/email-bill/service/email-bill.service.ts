import { Injectable } from '@angular/core';
import { EbillSearchRequest } from '../models/ebill-search-request.model';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { EbillSearchResult } from '../models/ebill-search-result.model';
import { ResendEbillRequest } from '../models/resend-ebill-request.model';
import { EmailBillRequest } from '../models/email-bill-request.model';
import { TestTable } from '../models/test-table.model';

@Injectable({
  providedIn: 'root'
})
export class EmailBillService {
  
  constructor(private _client: HttpClient,
    private _constants: ConstantsService) { }
  getBillsData(searchRequest: EbillSearchRequest) {
    const url = this._constants.GET_REPORT_EBILL_SEARCH;
    return (this._client.post<EbillSearchResult[]>(url, searchRequest));

  }

  getAllBranches() {
    const url = this._constants.API_URL + 'admin/common/branch/';
    return (this._client.get<any>(url));
  }
  
  getResendBills(ebillRequest: ResendEbillRequest) {
    const url = this._constants.GET_REPORT_EBILL_SEARCH_DETAILS;
    return (this._client.post<EbillSearchResult[]>(url, ebillRequest));
  }

  sendEmailBills(emailBillRequest: EmailBillRequest[]) {
    const url = this._constants.POST_REPORT_EBILL_SEND_EMAIL;
    return (this._client.post<any>(url, emailBillRequest));
  }
  sendBulkEmails(ebillRequest: ResendEbillRequest[]) {
    const url = this._constants.POST_REPORT_EBILL_SEND_EMAIL_BULK;
    return (this._client.post<any>(url, ebillRequest));
  }
  saveDate(testTableReq: TestTable) {
    
    //const url = "http://87f5a331-billing-billingco-3fd5-2009342219.ap-south-1.elb.amazonaws.com/wms/billing/test/saveDate";
    const url = this._constants.POST_EKS_TESTING_URL;
    return (this._client.post<any>(url, testTableReq));
  }
}
