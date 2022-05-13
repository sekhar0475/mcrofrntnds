import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { DocumentBranch } from '../models/document-branch.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentSearchUploadService {

  constructor(
    private _client: HttpClient,
    private _constants: ConstantsService) { }


     // get branch details.
  getBranchDetails() {
    const url = this._constants.API_URL + 'admin/common/branch/';
    return (this._client.get<any>(url));
  }
}
