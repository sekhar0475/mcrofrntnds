import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReceiptCancellationService } from '../../../receipt-cancellation/services/receipt-cancellation.service';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SearchInvWayBill } from '../../../doc-search-upload/models/search-bill-data.model';
import { DocumentWriteOff } from '../../models/document-data.model';
import { ReceiptCancel } from '../../models/receipt-cancel.model';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { CancelRecepitList } from '../../models/cancel-reason.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { BankAccounts } from '../../../doc-search-upload/models/bank-accounts.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-receipt-cancel-reason',
  templateUrl: './receipt-cancel-reason.component.html',
  styleUrls: ['./receipt-cancel-reason.component.scss']
})
export class ReceiptCancelReasonComponent implements OnInit, OnChanges {

  searchFormGroup: FormGroup; // search form group
  displayNewReceiptComp = false;
  @Input() receiptCancellation = false; // from search parent component
  @Input() searchData: SearchInvWayBill;  // data from search document parent component
  fromDate = null;
  toDate = null;
  docNumber = '';
  chequeNum = '';
  branchId = null;
  clearSearch = true;
  noDataFound = false;
  writeAccess = false;
  editAccess = false;
  documentData: DocumentWriteOff = {} as DocumentWriteOff;
  receiptData: ReceiptCancel = {} as ReceiptCancel;
  cancelResonList: CancelRecepitList[] = [];
  cancelReason = false;
  reasonId: number;
  @Input() bankAccounts: BankAccounts = {} as BankAccounts;
  bankDetails: BankAccounts = {} as BankAccounts;
  @Output() clearSearchValues: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _tokenStorage: TokenStorageService,
    private _receiptCancelService: ReceiptCancellationService,
  ) { }

  ngOnInit() {
    this.cancelReceiptReasonLookup(); // lookup value
    this.initForm();
    // this.setPermissions();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.values();
    this.loadData();
    this.setPermissions();
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

  // asisgn values from parent for search
  values() {
    this.fromDate = this.searchData.fromDate;
    this.toDate = this.searchData.toDate;
    this.docNumber = this.searchData.documentNum;
    this.chequeNum = this.searchData.chequeNum;
    this.branchId = this.searchData.documentBrId;
    this.bankDetails = this.bankAccounts;
  }
  // for page validations
  initForm() {
    this.searchFormGroup = new FormGroup({
      cancellationResonFc: new FormControl('', [Validators.required]),
      matRadioFc: new FormControl('')
    });
  }

  // cancel reason look up
  cancelReceiptReasonLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('RECEIPT_CANCEL_RSN').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.cancelResonList = [...this.cancelResonList, { cancelId: lkps.id, cancelValue: lkps.lookupVal, cancelDesc:lkps.descr}];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
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
  // check if cancel reason nul or not.
  checkIfCancelReason(reason: string) {
    if (reason == null) {
      this.cancelReason = true;
    } else {
      this.cancelReason = false;
    }

  }
  // to enable and disable new receipt child component
  newReceipt() {
    const _newRecpt = this.searchFormGroup.get('matRadioFc').value;
    const _cancelReasonVal = this.searchFormGroup.get('cancellationResonFc').value;

    if (_newRecpt === 'no') {
      this.displayNewReceiptComp = false;
      // to enable and disbale submit of new receipt component
      const _cancelReasonVal = this.searchFormGroup.get('cancellationResonFc').value;
      this.checkIfCancelReason(_cancelReasonVal);
    } else if (_newRecpt === 'yes') {
      this.displayNewReceiptComp = true;
      this.checkIfCancelReason(_cancelReasonVal);
    }

    // to get updated reason Id for the 
    this.cancelResonList.forEach(data => {
      this.reasonId = data.cancelId;

    });

  }

  // get receipt details for cancellation
  loadData() {
    if (this.receiptCancellation) {
      const _frmDt = this.fromDate == null ? '' : this.convert(this.fromDate.toString());
      const _toDt = this.toDate === null ? '' : this.convert(this.toDate.toString());
      const _docNumber = this.docNumber === '0' ? '' : this.docNumber;
      const _chequeNum = this.chequeNum === '0' ? '' : this.chequeNum;
      const _branchId = this.branchId === 0 ? null : this.branchId;
      // API call
      if (_chequeNum !== null || _branchId !== null || _docNumber !== null) {
        this._spinner.show();
        this._receiptCancelService.getReceiptCancelData(_frmDt, _toDt, _docNumber, _chequeNum, _branchId).subscribe(
          response => {
            this._spinner.hide();
            if (response === null) {
              this._toastr.warning('No Data Found For the Search');
              this.pickSearchData(this.noDataFound);
            } else {
              this.documentData = response;
              if(this.documentData.documentType.includes("PAYTM")){
                this._toastr.warning('Paytm receipts cannot be cancelled.');
                 this.pickSearchData(this.noDataFound);
              }
            }
          }, error => {
            this._spinner.hide();
            this.handleError(error);
            this.pickSearchData(this.noDataFound);
          }
        );
      }
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
      this._toastr.warning(error.message);
    }
  }

  dataValidation() {
    if (this.receiptCancellation && !this.displayNewReceiptComp) {
      this.receiptData = ({
        receiptId: this.documentData.documentId,
        receiptNum: null,
        reason: this.documentData.cancelReson == null ? null : this.documentData.cancelReson,
        reasonId: this.reasonId,
        remarks: this.documentData.cancelRemarks == null ? null : this.documentData.cancelRemarks,
        newReceiptFlag: 'N',
        insmtRef: this.documentData.newDocumentRefNum == null ? null : this.documentData.newDocumentRefNum,
        insmtRefDt: this.documentData.documentRefDt,
        sfxBankAcc: null,
        attachmentfileName: null,
        s3BucketName: null
      });
    }
  }

  // to save data to database
  submit(): void {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'This Action will Cancel the Receipt, Do You want to Continue?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.postCancelRcptData();
      } else {
        // do nothing.
      }
    });
  }


  // on submit thi method will be called
  postCancelRcptData() {
    this.dataValidation();  // validation
    if (!this._toastr.currentlyActive && this.receiptData) {
      if (this.receiptCancellation && !this.displayNewReceiptComp) {
        this._spinner.show();
        this._receiptCancelService.postReceiptCancelData(this.receiptData).subscribe(
          response => {
            this._spinner.hide();
            this._toastr.success('Document Successfully Cancelled');
            // this._router.navigate(['/dashboard']); // will change this later
            this.pickSearchData(this.clearSearch);
          },
          error => {
            this._spinner.hide();
            this.handleError(error);
          });
      }
    }
  }
  // to clear the search component values
  pickSearchData(clearSearch: boolean) {
    this.clearSearchValues.emit(clearSearch);
  }
}
