import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { AlliedSubmission } from '../models/allied-submission.model';
import { SubmittedResponse } from '../models/submission-respnose.model';
import { SubmissionData } from '../models/update-submission.model';
import { WmsSubmission } from '../models/wms-submission.model';

@Injectable({
  providedIn: 'root'
})
export class BillSubmissionService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService
  ) { }

  // to get submission date
  getDocumentForSearch(documentNum: string, docType: string) {
    const params1 = new HttpHeaders()
      .set('documentnumber', documentNum);
    let url = null;
    if (docType === 'CREDIT') {
      url = this._constants.GET_POST_SUBMISSION_UPDATE_CREDIT;
    } else if (docType === 'ALLIED') {
      url = this._constants.GET_POST_SUBMISSION_UPDATE_ALLIED;
    } else if (docType === 'WMS') {
      url = this._constants.GET_POST_SUBMISSION_UPDATE_WMS;
    }
    return (this._client.get<SubmissionData>(url, { headers: params1 }));
  }

  // credit
  postCreditSubmission(submissionData: SubmissionData) {
    const url = this._constants.GET_POST_SUBMISSION_UPDATE_CREDIT;
    return (this._client.post<SubmittedResponse>(url, submissionData));
  }

  // allied post
  postAlliedSubmission(submissionData: AlliedSubmission) {
    const url = this._constants.GET_POST_SUBMISSION_UPDATE_ALLIED;
    return (this._client.post<SubmittedResponse>(url, submissionData));
  }

  // wms post 
  postWmsSubmission(submissionData: WmsSubmission) {
    const url = this._constants.GET_POST_SUBMISSION_UPDATE_WMS;
    return (this._client.post<SubmittedResponse>(url, submissionData));
  }

}
