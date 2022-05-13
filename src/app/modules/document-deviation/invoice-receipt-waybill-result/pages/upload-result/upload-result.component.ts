import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { InvoiceWriteOffService } from '../../../invoice-write-off/services/invoice-write-off.service';
import { WaybillWriteOffService } from '../../../waybill-write-off/services/waybill-write-off.service';
import { CreditWriteOff } from '../../models/credit-writeoff.model';
import { DocumentWriteOff } from '../../models/document-data.model';
import { UploadResult } from '../../models/upload-data.model';
import { WaybillWriteOff } from '../../models/waybill-writeoff.model';
import { WmsAlliedWriteOff } from '../../models/wms-allied-writeoff.model';

@Component({
  selector: 'app-upload-result',
  templateUrl: './upload-result.component.html',
  styleUrls: ['./upload-result.component.scss']
})
export class UploadResultComponent implements OnChanges {
  @Input() docBranchId = null;
  @Input() documentType = null;
  @Input() uploadData: UploadResult[] = [];
  @Input() waybillType = null;
  writeOffArray: DocumentWriteOff[] = [];
  wayBillWriteOffArray: DocumentWriteOff[] = [];
  invalidData = false;
  errorMessage: ErrorMsg;
  dataSource: MatTableDataSource<UploadResult> = new MatTableDataSource();
  displayedColumns: string[] = ['documentNumber', 'documentType', 'outStandingAmt', 'writeOffAmt', 'writeOffReason', 'remarks'
    , 'status', 'message'];
  @Output() clearSearchValues: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _invoiceWriteOffService: InvoiceWriteOffService,
    private _waybillWriteOffService: WaybillWriteOffService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.validateExcel();
  }

  // validate excel data
  validateExcel() {
    if (this.uploadData.length > 0) {
      if (this.waybillType === 'PAID' || this.waybillType === 'TO-PAY') {
        if (this.documentType === 'RETAIL') {
          this.validateRetailWayBills();
        } else if (this.documentType === 'ALLIED_RETAIL_BILL') {
          this.validateAlliedRetailWayBills();
        }
      } else {
        this._spinner.show();
        this._invoiceWriteOffService.postBulkUploadForInvWriteOff(this.uploadData, this.documentType, this.docBranchId).subscribe(
          response => {
            this._spinner.hide();
            this.dataSource = new MatTableDataSource(response);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.checkIfInavlidData(response);
          }, error => {
            this._spinner.hide();
            this.handleError(error);
            this.pickSearchData(false);
          });
      }
    }
  }

  // validate way bills
  validateRetailWayBills() {
    this._spinner.show();
    this._waybillWriteOffService.postValidateWaybills(this.uploadData, this.docBranchId, this.waybillType).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.checkIfInavlidData(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort
      }, error => {
        this._spinner.hide();
        this.handleError(error);
        this.pickSearchData(false);
      });
  }

  // validate alllied retail way bills
  validateAlliedRetailWayBills() {
    this._spinner.show();
    this._waybillWriteOffService.postBulkUploadForAlliedRetailWriteOff(this.uploadData, this.documentType, this.docBranchId).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.checkIfInavlidData(response);
      }, error => {
        this._spinner.hide();
        this.handleError(error);
        this.pickSearchData(false);
      });

  }


  // if parsing data is inavlid
  checkIfInavlidData(uploadResult: UploadResult[]) {
    let i = 0;
    this.invalidData = false;
    for (i = 0; i < uploadResult.length; i++) {
      if (uploadResult[i].status === 'INVALID') {
        this.invalidData = true;
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

  // to save data to database
  submit(): void {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Please confirm if you want to continue with ' + this.documentType + ' writeOff?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.postWriteOffData();
      } else {
        // do nothing.
      }
    });
  }

  // write off array for post
  dataForPost() {
    this.dataSource.data.forEach(data => {
      this.writeOffArray.push({
        documentId: data.documentId,
        documentNum: data.documentNumber,
        documentType: data.documentType,
        documentDt: data.documentDt,
        outstandingAmt: Number(data.outStandingAmt),
        writeOffAmt: Number(data.writeOffAmt),
        writeOffReason: data.writeOffReason,
        remarks: data.remarks,
        status: data.status,
        message: data.message,
        documentRefNum: null,
        documentRefDt: null,
        cancelReson: null,
        cancelId: null,
        cancelRemarks: null,
        newDocumentRefNum: null,
        sfxBankAcc: null
      });
    });
  }

  // on submit this method will be called
  postWriteOffData() {
    this.dataForPost();  // validation
    if (!this._toastr.currentlyActive) {
      if (this.documentType === 'RETAIL') {
        this.postWayBillWriteOff(this.writeOffArray);
      } else {
        this.postInvoiceWriteOff(this.writeOffArray);
      }
    }
  }

   // invoice write off API
   postInvoiceWriteOff(invoiceWriteOffData: DocumentWriteOff[]) {
    this._spinner.show();
    if (this.documentType === 'CREDIT') {
      const invoiceData: CreditWriteOff[] = [];
      invoiceWriteOffData.forEach(data => {
        invoiceData.push({
          documentId: data.documentId,
          documentNumber: data.documentNum,
          documentType: data.documentType,
          writeOffReason: data.writeOffReason,
          writeOffAmt: data.writeOffAmt,
          documentDt: data.documentDt,
          outStandingAmt: data.outstandingAmt,
          remarks: data.remarks,
          status: data.status,
          message: data.message
        });
      });
      this._invoiceWriteOffService.postCreditWriteOfData(invoiceData, this.documentType).subscribe(
        response => {
          this._spinner.hide();
          this._toastr.success('Invoice Write Off Successful');
          this.pickSearchData(true);
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        });
    } else {
      const invoiceData: WmsAlliedWriteOff[] = [];
      invoiceWriteOffData.forEach(data => {
        invoiceData.push({
          documentId: data.documentId,
          writeOffReason: data.writeOffReason,
          writeOffAmt: data.writeOffAmt,
          remarks: data.remarks
        });
      });
      this._invoiceWriteOffService.postWmsAlliedWriteOfData(invoiceData, this.documentType).subscribe(
        response => {
          this._spinner.hide();
          this._toastr.success('Invoice Write Off Successful');
          this.pickSearchData(true);
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        });
    }
  }


 // way bill write off amout for Retail WayBill in propel-i
   postWayBillWriteOff(waybillWriteOff: DocumentWriteOff[]) {
    this._spinner.show();
    const waybillWriteOffData: WaybillWriteOff[] = [];
    waybillWriteOff.forEach(data => {
      waybillWriteOffData.push({
        documentId: data.documentId,
        documentNum: data.documentNum,
        documentType:  data.documentType,
        writeOffReason: data.writeOffReason,
        writeOffAmt:  data.writeOffAmt,
        documentDt: data.documentDt,
        outStandingAmt:  data.outstandingAmt,
        remarks:  data.remarks,
        status:  data.status,
        message:  data.message
      });
    });
    this._waybillWriteOffService.postWayBillWriteOff(waybillWriteOffData).subscribe(
      response => {
        this._spinner.hide();
        this._toastr.success('Waybill Write Off Successful');
        this.pickSearchData(true);
      }, error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        // page refresh.
        this.pickSearchData(true);
      } else {
        // do nothing.
      }
    });
  }

  // to clear the search component values
  pickSearchData(clearSearch: boolean) {
    this.clearSearchValues.emit(clearSearch);
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

