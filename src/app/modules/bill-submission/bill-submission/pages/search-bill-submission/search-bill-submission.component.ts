import { Component, OnInit } from '@angular/core';
import { UpdateSubmissionSearch } from '../../models/search-data-for-submission.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SubmissionDocType } from '../../models/submission-doc-type.model';
import { BillSubmissionService } from '../../services/bill-submission.service';
import { SubmissionData } from '../../models/update-submission.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';

@Component({
  selector: 'app-search-bill-submission',
  templateUrl: './search-bill-submission.component.html',
  styleUrls: ['./search-bill-submission.component.scss']
})
export class SearchBillSubmissionComponent implements OnInit {

  searchData: UpdateSubmissionSearch[] = [];
  documentTypeList: SubmissionDocType[] = [];
  searchFormGroup: FormGroup;
  displaySubmissionComp = false;
  documentType = null;
  submissionData: SubmissionData = {} as SubmissionData;
  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _invSubmissionService: BillSubmissionService) { }

  ngOnInit() {
    this.documentTypeLookup();
    this.initForm();
  }

  // replace with bill type Lov for bill type
  documentTypeLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DEVIATION_INV_SUBMSN_DOC_TYPE').subscribe(
      response => {
        console.log(response);
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.documentTypeList = [...this.documentTypeList, { documentId: lkps.id, documentValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // for page validations
  initForm() {
    this.searchFormGroup = new FormGroup({
      documentTypeFc: new FormControl('CREDIT', [Validators.required]),
      documentNumFc: new FormControl('', [Validators.required])
    });
  }

  search(): void {
    this.loadData();
  }

  // document search for submission
  loadData() {
    const _docType = this.searchFormGroup.get('documentTypeFc').value;
    const _docNumber = this.searchFormGroup.get('documentNumFc').value;
    this._spinner.show();
    this._invSubmissionService.getDocumentForSearch(_docNumber.toUpperCase(), _docType).subscribe(
        response => {
          this._spinner.hide();
          this.submissionData = response;
          this.documentType = _docType;
          if (response === null) {
            this._toastr.warning('No Data Found for the Search');
            this.displaySubmissionComp = false;
          } else {
            this.displaySubmissionComp = true;
          }
        },
        error => {
          this._spinner.hide();
          this.displaySubmissionComp = false;
          this.handleError(error);
        });
  }


  // errors function
  handleError(error: any) {
    if (error.error != null) {
      if (error.error.errorCode === 'handled_exception') {
        this._toastr.warning((error.error.errorMessage));
      } else {
        this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }

  // clear search values from child.
  getClearValue(selected: boolean) {
    if (selected) {
      this.loadData();
    } else {
      this.searchFormGroup.reset();
      this.displaySubmissionComp = false;
    }
  }
}


