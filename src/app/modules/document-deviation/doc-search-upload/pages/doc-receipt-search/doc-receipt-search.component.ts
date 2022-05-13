import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SearchInvWayBill } from '../../models/search-bill-data.model';
import { DocumentBranchComponent } from '../document-branch/document-branch.component';
import { MatDialog, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { DocumentBranch } from '../../models/document-branch.model';
import { ToastrService } from 'ngx-toastr';
import { BankAccounts } from '../../models/bank-accounts.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';


@Component({
  selector: 'app-doc-receipt-search',
  templateUrl: './doc-receipt-search.component.html',
  styleUrls: ['./doc-receipt-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class DocReceiptSearchComponent implements OnInit {

  // intially false if routed through receipt write off this will be set to true
  @Input() receiptWriteOff = false;
  // intially false if routed through receipt cancellation this will be set to true
  @Input() receiptCancellation = false;
  searchFormGroup: FormGroup; // search form group

  searchData: SearchInvWayBill = {
    documentType: null,
    fromDate: null,
    toDate: null,
    documentBrName: null,
    documentBrId: null,
    documentNum: null,
    chequeNum: null
  };
  docBranchList: DocumentBranch[] = [];
  displayCancellationComp = false; // to display upload component
  displayInputTable = false;   // to display input table for write off
  fileToUpload: File = null;
  writeAccess = false;
  editAccess = false;
  bankAccounts: BankAccounts = {
    bankAccNumGeneral: null,
    bankAccNumOffline: null,
    bankAccNumOnline: null,
  };
  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService) { }

  ngOnInit() {
    this.initForm();
  }

  // for page validations
  initForm() {
    this.searchFormGroup = new FormGroup({
      documentNumFc: new FormControl('', [Validators.required]),
      fromDtFc: new FormControl(''),
      toDtFc: new FormControl(''),
      chequeNumFc: new FormControl(''),
      documentBrFc: new FormControl('', [Validators.required])
    });
  }
  // if cheque number field data entered disable document number field
  isDisabledDoc() {
    const _isDisabled = this.searchFormGroup.get('chequeNumFc').value;
    if (_isDisabled) {
      this.searchFormGroup.get('documentNumFc').disable();
    } else {
      this.searchFormGroup.get('documentNumFc').enable();
    }
  }

  // if document number field data entered disable cheque number field
  isDisabledCheq() {
    const _isDisabled = this.searchFormGroup.get('documentNumFc').value;
    if (_isDisabled) {
      this.searchFormGroup.get('chequeNumFc').disable();
    } else {
      this.searchFormGroup.get('chequeNumFc').enable();
    }
  }

  search(): void {
    let newSearchData = {} as SearchInvWayBill;

    // on search assigning values to the export data to child
    const fromDate = this.searchFormGroup.get('fromDtFc').value;
    const documentnum = this.searchFormGroup.get('documentNumFc').value;
    const todate = this.searchFormGroup.get('toDtFc').value;
    const chequeNum = this.searchFormGroup.get('chequeNumFc').value;
    const docBranchName = this.searchFormGroup.get('documentBrFc').value;
    const docBranchId = this.searchData.documentBrId;
    // assign values
    newSearchData.fromDate = fromDate;
    newSearchData.documentNum = documentnum == null ? '' : documentnum.toUpperCase();
    newSearchData.toDate = todate;
    newSearchData.chequeNum = chequeNum == null ? '' : chequeNum.toUpperCase();
    newSearchData.documentBrId = docBranchId == null ? 0 : docBranchId;
    newSearchData.documentBrName = docBranchName;
    //
    this.searchData = newSearchData;
    //
    if (this.receiptWriteOff) {
      this.displayCancellationComp = false;
      this.displayInputTable = true;
    }
    if (this.receiptCancellation) {
      this.displayCancellationComp = true;
      this.displayInputTable = false;
    }
  }

  // to handle header for receipt write off and cancellation
  header() {
    if (this.receiptWriteOff) {
      return 'Receipt Write-Off';
    } else if (this.receiptCancellation) {
      return 'Receipt Cancellation';
    }
  }

  // clear search values from parent table.
  getClearValue(selected: boolean) {
    if (selected) {
      this.displayInputTable = false;
      this.displayCancellationComp = false;
      this.searchFormGroup.reset();
    } else {
      this.displayCancellationComp = false;
      this.displayInputTable = false;
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


  // for document branch search
  documentBrSearch() {
    const dialogRef = this._dialog.open(DocumentBranchComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          console.log('Bank Details',result[0]);
          this.searchFormGroup.controls.documentBrFc.setValue(result[0].branchName);
          this.searchData.documentBrId = result[0].branchId;
          this.bankAccounts.bankAccNumGeneral = result[0].bankAccNumGeneral;
          this.bankAccounts.bankAccNumOffline = result[0].bankAccNumOffline;
          this.bankAccounts.bankAccNumOnline = result[0].bankAccNumOnline;
        }
      }
    });
  }
  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        if (this.displayInputTable) {
          this.displayInputTable = false;
          this.searchFormGroup.reset();
        } else if (this.displayCancellationComp) {
          this.displayCancellationComp = false;
        }
        this.refresh();
      } else {
        // do nothing.
      }
    });
  }
  // to refresh the search paramters
  refresh() {
    this.searchData.chequeNum = null;
    this.searchData.documentNum = null;
    this.searchData.fromDate = null;
    this.searchData.toDate = null;
    this.searchData.documentBrId = null;
    this.searchData.documentBrName = null;
    this.searchFormGroup.reset();
  }
}

