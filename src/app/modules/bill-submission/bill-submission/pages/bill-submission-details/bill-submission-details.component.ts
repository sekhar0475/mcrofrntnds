import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { DocumentTypeList } from 'src/app/modules/document-deviation/doc-search-upload/models/document-type.model';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { mobileNumberValidator } from 'src/app/modules/user-mangement/user/services/user-validators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { AlliedSubmission } from '../../models/allied-submission.model';
import { SubmittedResponse } from '../../models/submission-respnose.model';
import { SubmissionData } from '../../models/update-submission.model';
import { WmsSubmission } from '../../models/wms-submission.model';
import { BillSubmissionService } from '../../services/bill-submission.service';

@Component({
  selector: 'app-bill-submission-details',
  templateUrl: './bill-submission-details.component.html',
  styleUrls: ['./bill-submission-details.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class BillSubmissionDetailsComponent implements OnInit {

  createFormGroup: FormGroup;
  todayDate = new Date();
  documentTypeList: DocumentTypeList[] = [];
  submsnResp: SubmittedResponse = {} as SubmittedResponse;
  writeAccess = false;
  editAccess = false;
  @Input() documentType = null;
  errorMessage: ErrorMsg;
  @Input() submissionData: SubmissionData = {
    documentId: null,
    documentNum: null,
    submsnDt: null,
    submsnPersonName: null,
    submsnContactNum: null,
    subsnMail: null,
    submsnNote: null,
    documentDt: null
  };

  submitedData: SubmissionData = {
    documentId: null,
    documentNum: null,
    submsnDt: null,
    submsnPersonName: null,
    submsnContactNum: null,
    subsnMail: null,
    submsnNote: null,
    documentDt: null
  };
  @Output() clearValues: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _tokenStorage: TokenStorageService,
    private _invSubmissionService: BillSubmissionService) { }

  ngOnInit() {
    this.setPermissions();
    this.initForm();
  }
  setPermissions() {
    // set the user access
    const path = this._router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y') {
      this.writeAccess = true;
      this.editAccess = true;
      return;
    } else if (this._tokenStorage.getCurrentModuleUpdateFlag() != null && this._tokenStorage.getCurrentModuleUpdateFlag() === 'Y') {
      this.editAccess = true;
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
      this.editAccess = false;
    }
  }

  // to convert system generated date for search in database
  convert(str: string) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join('/');
    } else {
      return '';
    }
  }

  // for page validations
  initForm() {
    this.createFormGroup = new FormGroup({
      submittedToPersonNameFc: new FormControl('', [Validators.required]),
      submsnDtFc: new FormControl(''),
      submittedToContactNumberFc: new FormControl('', [Validators.required, mobileNumberValidator]),
      submissionNotesFc: new FormControl(''),
      submittedToContactMailFc: new FormControl('', [Validators.email, Validators.required])
    });

    // set date on page load
    this.createFormGroup.controls.submsnDtFc.setValue(new Date());
  }

  // to save data to database
  submit(): void {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Please confirm if you want to continue?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.postSubmissionValidData();
      } else {
        // do nothing.
      }
    });
  }

  postSubmissionValidData() {
    const _submsnDt = this.createFormGroup.get('submsnDtFc').value;
    this.submitedData = ({
      documentId: this.submissionData.documentId,
      documentNum: this.submissionData.documentNum,
      submsnDt: this.convert(_submsnDt.toString()),
      documentDt: _submsnDt,
      submsnPersonName: this.createFormGroup.get('submittedToPersonNameFc').value,
      submsnContactNum: this.createFormGroup.get('submittedToContactNumberFc').value,
      subsnMail: this.createFormGroup.get('submittedToContactMailFc').value,
      submsnNote: this.createFormGroup.get('submissionNotesFc').value,
    });
    console.log(this.submitedData);
    if (this.documentType) {
      this.postSubmissionData(this.submitedData, this.documentType);
    }
  }

  //  submission post
  postSubmissionData(submsnData: SubmissionData, documentType: string) {
    if (documentType === 'CREDIT') {
      this._spinner.show();
      this._invSubmissionService.postCreditSubmission(submsnData).subscribe(
        response => {
          this._spinner.hide();
          this.submsnResp = response;
          this._toastr.success(this.submsnResp.message);
          this.pickSearchData(false);
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    } else if (documentType === 'ALLIED') {
      this._spinner.show();
      let alliedSubmissionData: AlliedSubmission = {} as AlliedSubmission;
      alliedSubmissionData = {
        documentId: submsnData.documentId,
        submsnDt: submsnData.submsnDt,
        submsnPersonName: submsnData.submsnPersonName,
        submsnContactNum: submsnData.submsnContactNum,
        submsnNote: submsnData.submsnNote,
        subsnMail: submsnData.subsnMail
      };
      this._invSubmissionService.postAlliedSubmission(alliedSubmissionData).subscribe(
        response => {
          this._spinner.hide();
          this.submsnResp = response;
          this._toastr.success(this.submsnResp.message);
          this.pickSearchData(false);
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    } else if (documentType === 'WMS') {
      this._spinner.show();
      let wmsSubmissionData: WmsSubmission = {} as WmsSubmission;
      wmsSubmissionData = {
        documentId: submsnData.documentId,
        submsnDt: submsnData.submsnDt,
        submsnPersonName: submsnData.submsnPersonName,
        submsnContactNum: submsnData.submsnContactNum,
        submsnNote: submsnData.submsnNote,
        subsnMail: submsnData.subsnMail
      };
      this._invSubmissionService.postWmsSubmission(wmsSubmissionData).subscribe(
        response => {
          this._spinner.hide();
          this.submsnResp = response;
          this._toastr.success(this.submsnResp.message);
          this.pickSearchData(false);
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    }
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
      this._toastr.warning(error.error.errorMessage);
    }
  }

  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.pickSearchData(true);
        this.createFormGroup.reset();
        this.createFormGroup.controls.submsnDtFc.setValue(new Date());
      } else {
        // do nothing.
      }
    });
  }

  // to clear the search component values
  pickSearchData(clearSearch: boolean) {
    this.clearValues.emit(clearSearch);
  }

  // errors string response function
  handleStringError(error: any) {
    this.errorMessage = JSON.parse(error.error);
    console.log(this.errorMessage);
    if (this.errorMessage != null) {
      if (this.errorMessage.errorCode === 'handled_exception') {
        this._toastr.warning((this.errorMessage.errorMessage));
      } else {
        this._toastr.warning(this.errorMessage.errorMessage + ' Details: ' + this.errorMessage.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }
}
