import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { DocumentWriteOff } from '../../models/document-data.model';
import { ReceiptCancellationService } from '../../../receipt-cancellation/services/receipt-cancellation.service';
import { ReceiptCancel } from '../../models/receipt-cancel.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { NewReceiptDialogComponent } from './dialog/new-receipt-dialog.component';
import { BankAccounts } from '../../../doc-search-upload/models/bank-accounts.model';
import { NgxSpinnerService } from 'ngx-spinner';

// for bank account
interface SafexbankAccounts {
  value: string;
}

@Component({
  selector: 'app-new-receipt',
  templateUrl: './new-receipt.component.html',
  styleUrls: ['./new-receipt.component.scss'],
})
export class NewReceiptComponent implements OnInit {

  fileToUpload: File = null;
  bankAccList: SafexbankAccounts[] = [];
  searchFormGroup: FormGroup; // search form group
  @Input() documentData: DocumentWriteOff;
  @Input() cancelReason = false;  // this will be true ,if new receipt is created
  @Input() bankDetails: BankAccounts;
  receiptData: ReceiptCancel = {} as ReceiptCancel;
  // for post response
  receipts: ReceiptCancel[] = [];
  clearSearch = true;
  @Input() writeAccess = false;
  @Input() reasonId = null;
  @Output() clearSearchValues: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _receiptCancelService: ReceiptCancellationService) { }

  ngOnInit() {
    this.initForm();
    this.setBankAccount();
  }

  // for page validations
  initForm() {
    this.searchFormGroup = new FormGroup({
      referenceDocFc: new FormControl('', [Validators.required]),
      sfxBankAccFc: new FormControl('', [Validators.required])
    });
  }

  // dummy function to handel file
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  // to get the bank account details from document search main component
  setBankAccount() {
    if (this.bankDetails) {
      if (this.bankDetails.bankAccNumGeneral) {
        this.bankAccList = [...this.bankAccList, { value: this.bankDetails.bankAccNumGeneral }];
      }
      if (this.bankDetails.bankAccNumOffline) {
        this.bankAccList = [...this.bankAccList, { value: this.bankDetails.bankAccNumOffline }];
      }
      if (this.bankDetails.bankAccNumOnline) {
        this.bankAccList = [...this.bankAccList, { value: this.bankDetails.bankAccNumOnline }];
      }
    } else {
      this._toastr.warning('Bank Details Service is Down');
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

  createData() {
    if (this.documentData) {
      this.receiptData = ({
        receiptId: this.documentData.documentId,
        receiptNum: null,
        reason: this.documentData.cancelReson == null ? null : this.documentData.cancelReson,
        reasonId: this.reasonId,
        remarks: this.documentData.cancelRemarks == null ? null : this.documentData.cancelRemarks,
        newReceiptFlag: 'Y', // to create new receipt
        insmtRef: this.documentData.newDocumentRefNum,
        insmtRefDt: this.documentData.documentRefDt,
        sfxBankAcc: this.documentData.sfxBankAcc,
        attachmentfileName: (this.fileToUpload != null ? this.fileToUpload.name : null),
        s3BucketName: ''
      });
    }
  }

  // on submit thi method will be called
  postCancelAndCrtNewRcptData() {
    this.createData();  // validation
    if (!this._toastr.currentlyActive && this.receiptData) {
      let uploadStatus = true;
      let uploadMsg = null;
      this._spinner.show();
      this._receiptCancelService.postReceiptCancelData(this.receiptData).subscribe(
        response => {
          this._spinner.hide();
          this.receipts = response;
          const _receiptNum = this.receipts['receiptNum'.toString()];
          if (this.fileToUpload != null) {
            const fileName = this.receipts['attachmentfileName'.toString()];
            this._receiptCancelService.onUpload(this.fileToUpload, fileName).subscribe(
              () => {
                uploadStatus = true;
              },
              error => {
                this._spinner.hide();
                console.log(error);
                uploadMsg = error;
                uploadStatus = false;
              }
            );
          }
          this.openApplicationDialog(_receiptNum, uploadStatus, uploadMsg);
        },
        error => {
          this.handleError(error);
        });
    }
  }

  // to display receipt number after creation
  openApplicationDialog(receiptNum: string, uploadStatus: boolean, uploadMsg: string) {
    let msg = null;
    if (uploadStatus) {
      msg = 'Receipt Cancellled and New Receipt (' + receiptNum + ')  created successfully !';
    } else {
      msg =
      'Receipt Cancellled and New Receipt (' + receiptNum + ')  created successfully !. Attachment upload failed. Error Msg: ' + uploadMsg;
    }
    const dialogRef = this._dialog.open(NewReceiptDialogComponent, {
      data: msg,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.receiptData = {} as ReceiptCancel;
        // this._router.navigate(['/dashboard']);
        // this.reloadPage(); // confirmation required for page load (needs to checked)
        this.pickSearchData(this.clearSearch);
      } else {
        // do nothing
      }
      // back drop clicked.
      dialogRef.backdropClick().subscribe(() => {
        // Close the dialog
        dialogRef.close();
      });
    });
  }

  // to save data to database
  submit(): void {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'This Action will Cancel And Creates the New Receipt, Do You want to Continue?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.postCancelAndCrtNewRcptData();
      } else {
        // do nothing.
      }
    });
  }
  // to reload page once new receipt is created
  reloadPage() {
    location.reload();
  }
  // to clear the search component values
  pickSearchData(clearSearch: boolean) {
    this.clearSearchValues.emit(clearSearch);
  }
}

