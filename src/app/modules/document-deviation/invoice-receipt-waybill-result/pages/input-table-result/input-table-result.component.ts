import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { SearchInvWayBill } from '../../../doc-search-upload/models/search-bill-data.model';
import { DocumentWriteOff } from '../../models/document-data.model';
import { ReceiptWriteoffService } from '../../../receipt-write-off/services/receipt-writeoff.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { Router } from '@angular/router';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { WriteOffReason } from '../../models/write-off-reason.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { InvoiceWriteOffService } from '../../../invoice-write-off/services/invoice-write-off.service';
import { WaybillWriteOffService } from '../../../waybill-write-off/services/waybill-write-off.service';
import { WaybillWriteOff } from '../../models/waybill-writeoff.model';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { WmsAlliedWriteOff } from '../../models/wms-allied-writeoff.model';
import { CreditWriteOff } from '../../models/credit-writeoff.model';

@Component({
  selector: 'app-input-table-result',
  templateUrl: './input-table-result.component.html',
  styleUrls: ['./input-table-result.component.scss']
})
export class InputTableResultComponent implements OnInit, OnChanges {

  fromDate = null;
  toDate = null;
  docNumber = '';
  chequeNum = '';
  documentType = '';
  docType = null;
  branchId = null;
  clearSearch = true;
  doDataFound = false;
  writeAccess = false;
  editAccess = false;
  errorMessage: ErrorMsg;
  writeOffArray: DocumentWriteOff[] = [];
  wayWriteOffArray: WaybillWriteOff[] = [];
  reasonList: WriteOffReason[] = [];
  @Input() receiptWriteOff = false;  // receipt write off component
  @Input() invoiceWriteOff = false;  // invoice write off component
  @Input() wayBillWriteOff = false;  // waybill write off component
  @Input() searchData: SearchInvWayBill;  // data from search document component
  @Input() waybillType = null; // from upload waybill component
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // to clear search values
  @Output() clearSearchValues: EventEmitter<boolean> = new EventEmitter<boolean>();
  dataSource: MatTableDataSource<DocumentWriteOff> = new MatTableDataSource();
  displayedColumns: string[] = ['documentNumber', 'documentType', 'outstandingAmt', 'writeOffAmt', 'writeOffReason', 'remarks'];

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _tokenStorage: TokenStorageService,
    private _receiptWriteOffService: ReceiptWriteoffService,
    private _invoiceWriteOffService: InvoiceWriteOffService,
    private _waybillWriteOffService: WaybillWriteOffService) { }

  ngOnInit() {
    this.setPermissions();
    this.writeOffReasonLookup(); // lookup value
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

  ngOnChanges(changes: SimpleChanges) {
    this.values();
    this.loadData();  // load if any change in search
  }

  // assign search values
  values() {
    this.fromDate = this.searchData.fromDate;
    this.toDate = this.searchData.toDate;
    this.docNumber = this.searchData.documentNum;
    this.chequeNum = this.searchData.chequeNum;
    this.documentType = this.searchData.documentType;
    this.branchId = this.searchData.documentBrId;
  }

  // to convert system generated date for search in database
  convert(str: string) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      if (this.wayBillWriteOff) {
        return [day, mnth, date.getFullYear()].join('-');
      } else {
        return [day, mnth, date.getFullYear()].join('/');
      }
    } else {
      return '';
    }
  }

  // to load data from api's
  loadData() {
    const _frmDt = this.fromDate == null ? '' : this.convert(this.fromDate.toString());
    const _toDt = this.toDate == null ? '' : this.convert(this.toDate.toString());
    const _docNumber = this.docNumber === '0' ? '' : this.docNumber;
    const _chequeNum = this.chequeNum === '0' ? '' : this.chequeNum;
    const _branchId = this.branchId === 0 ? null : this.branchId;
    const _documentType = this.documentType;

    // receipt write off GET Data
    if (this.receiptWriteOff) {
      this.docType = 'RECEIPT';
      if (_chequeNum !== null || _branchId !== null || _docNumber !== null) {
        this.callGetReceiptWriteOffApi(_frmDt, _toDt, _docNumber.toUpperCase(), _chequeNum, _branchId.toString());
      }
    }
    // Invoice write off GET Data
    if (this.invoiceWriteOff) {
      this.docType = this.documentType;
      if (_branchId !== null || _docNumber !== null) {
        this.callGetInvoiceWriteOffApi(_frmDt, _toDt, _docNumber.toUpperCase(), _branchId.toString(), _documentType);
      }
    }
    // Waybill Write Off GET Data
    if (this.wayBillWriteOff) {
      this.docType = this.documentType;
      const wayBillType = this.waybillType;
      if (_branchId !== null || _docNumber !== null) {
        this.callGetWaybillWriteOffApi(_frmDt, _toDt, _docNumber, _branchId, wayBillType, _documentType);
      }
    }
  }

  // to call receipt write off Get API
  callGetReceiptWriteOffApi(fromDt: string, toDt: string, docNumber: string, chequeNum: string, docbranchId: string) {
    this._spinner.show();
    this._receiptWriteOffService.getReceiptWriteOfData(
      fromDt, toDt, docNumber, chequeNum, docbranchId).subscribe(
        response => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.dataSource.paginator = this.paginator;
          if (this.dataSource.data.length === 0) {
            this._toastr.warning('No Data Found For' + ' ' + this.docNumber + '' + this.chequeNum);
            this.pickSearchData(this.doDataFound);
          }
        },
        error => {
          this._spinner.hide();
          this.pickSearchData(this.doDataFound);
          this.handleError(error);
        });
  }

  // call invoice Write off GET api's
  callGetInvoiceWriteOffApi(fromDt: string, toDt: string, docNumber: string, docbranchId: string, documentType: string) {
    this._spinner.show();
    this._invoiceWriteOffService.getInvoiceData(fromDt, toDt, docNumber, docbranchId, documentType).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('No Data Found For' + ' ' + this.docNumber);
          this.pickSearchData(this.doDataFound);
        }
      },
      error => {
        this._spinner.hide();
        this.pickSearchData(this.doDataFound);
        this.handleError(error);
      });
  }

  // call waybill Write off GET api's
  callGetWaybillWriteOffApi(
    fromDt: string, toDt: string, docNumber: string, docbranchId: number,
    wayBillType: string, documentType: string) {
    if (documentType === 'RETAIL') {
      this._spinner.show();
      this._waybillWriteOffService.getWayBillForWriteOff(fromDt, toDt, docNumber, docbranchId, wayBillType).subscribe(
        response => {
          this.dataSource = new MatTableDataSource(response);
          this.dataSource.paginator = this.paginator;
          if (this.dataSource.data.length === 0) {
            this._toastr.warning('No Data Found For' + ' ' + this.docNumber);
            this.pickSearchData(this.doDataFound);
          }
          this._spinner.hide();
        },
        error => {
          this.pickSearchData(this.doDataFound);
          this.handleError(error);
          this._spinner.hide();
        });
    } else {  // allied retail
      this._spinner.show();
      this._waybillWriteOffService.getAlliedRetailWayBillData(fromDt, toDt, docNumber, docbranchId,
        wayBillType, documentType).subscribe(
          response => {
            this._spinner.hide();
            this.dataSource = new MatTableDataSource(response);
            this.dataSource.paginator = this.paginator;
            if (this.dataSource.data.length === 0) {
              this._toastr.warning('No Data Found For' + ' ' + this.docNumber);
              this.pickSearchData(this.doDataFound);
            }
          }, error => {
            this._spinner.hide();
            this.pickSearchData(this.doDataFound);
            this.handleError(error);
          });
    }
  }
  // write off reason look up
  writeOffReasonLookup() {
    this._lookupService.getLookupValuesByType('INV_WRITEOFF_RSN').subscribe(
      response => {
        response.data.forEach(
          lkps => {
            this.reasonList = [...this.reasonList, { reasonId: lkps.id, reasonValue: lkps.lookupVal, reasonDesc: lkps.descr }];
          });
      },
      error => {
        this.handleError(error);
      });
  }

  // to save data to database
  submit(): void {
    this.dataValidation();
    if (!this._toastr.currentlyActive) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Please confirm if you want to continue with writeOff?'
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
  }
  // data validation before save into data base
  dataValidation() {
    let i = 0;
    let noWriteOffAmt = 0;
    let noWriteOffReason = 0;
    let writeOffValueGreater = 0;
    this.writeOffArray = [];
    let documentNum = null;
    this.dataSource.data.forEach(data => {
      this.writeOffArray.push({
        documentId: data.documentId,
        documentNum: data.documentNum,
        documentType: data.documentType,
        documentDt: data.documentDt,
        outstandingAmt: data.outstandingAmt,
        writeOffAmt: data.writeOffAmt,
        writeOffReason: data.writeOffReason,
        remarks: data.remarks,
        status: data.status,
        message: data.message,
        documentRefNum: data.documentRefNum,
        documentRefDt: data.documentRefDt,
        cancelReson: null,
        cancelId: null,
        cancelRemarks: null,
        newDocumentRefNum: null,
        sfxBankAcc: null
      });
    });

    for (i = 0; i < this.writeOffArray.length; i++) {
      if (this.writeOffArray[i].writeOffAmt == null) {
        noWriteOffAmt = 1;
        documentNum = this.writeOffArray[i].documentNum;
      }
      if (this.writeOffArray[i].writeOffReason == null) {
        noWriteOffReason = 1;
        documentNum = this.writeOffArray[i].documentNum;
      }

      if (this.writeOffArray[i].writeOffAmt > this.writeOffArray[i].outstandingAmt) {
        writeOffValueGreater = 1;
        documentNum = this.writeOffArray[i].documentNum;
      }
    }
    if (noWriteOffAmt > 0) {
      this._toastr.warning('Write-Off Amount Cannot Be Null');
    }
    if (noWriteOffReason > 0) {
      this._toastr.warning('Write-Off Reason Cannot Be Null');
    }
    if (writeOffValueGreater > 0) {
      this._toastr.warning('Write-Off Amount Cannot Be Greater Than Oustanding Amount');
    }
  }

  // on submit thi method will be called
  postWriteOffData() {
    this.dataValidation();  // validation
    if (!this._toastr.currentlyActive) {
      if (this.receiptWriteOff) {
        this.postReceiptWriteOff(this.writeOffArray);
      } else if (this.invoiceWriteOff) {
        this.postInvoiceWriteOff(this.writeOffArray);
      } else if (this.wayBillWriteOff) {
        if (this.documentType === 'RETAIL') {
          this.postWaybillWriteOff(this.writeOffArray);
        } else if (this.documentType === 'ALLIED_RETAIL_BILL') {
          this.postAlliedRetailWriteOff(this.writeOffArray);
        }
      }
    }
  }

  // receipt write off Api for post
  postReceiptWriteOff(receptWriteOffData: DocumentWriteOff[]) {
    this._spinner.show();
    this._receiptWriteOffService.postReceiptWriteOfData(receptWriteOffData).subscribe(
      response => {
        this._spinner.hide();
        this._toastr.success('Receipt Write Off Successful');
        // this._router.navigate(['/dashboard']);
        this.pickSearchData(this.clearSearch);  // this will reload the page
      }, error => {
        this._spinner.hide();
        this.handleStringError(error);
      });
  }

  // invoice write off API
  postInvoiceWriteOff(invoiceWriteOffData: DocumentWriteOff[]) {
    this._spinner.show();
    if (this.docType === 'CREDIT') {
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
      this._invoiceWriteOffService.postCreditWriteOfData(invoiceData, this.docType).subscribe(
        response => {
          this._spinner.hide();
          this._toastr.success('Invoice Write Off Successful');
          this.pickSearchData(this.clearSearch);
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
      this._invoiceWriteOffService.postWmsAlliedWriteOfData(invoiceData, this.docType).subscribe(
        response => {
          this._spinner.hide();
          this._toastr.success('Invoice Write Off Successful');
          this.pickSearchData(this.clearSearch);
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        });
    }
  }

  // way bill write off amout for Retail WayBill in propel-i
  postWaybillWriteOff(waybillWriteOff: DocumentWriteOff[]) {
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
        this.pickSearchData(this.clearSearch);
      }, error => {
        this._spinner.hide();
        this.handleStringError(error);
      });
  }

  // post allied retail write off amount in billing application
  postAlliedRetailWriteOff(invoiceWriteOffData: DocumentWriteOff[]) {
    this._spinner.show();
    const invoiceData: WmsAlliedWriteOff[] = [];
    invoiceWriteOffData.forEach(data => {
      invoiceData.push({
        documentId: data.documentId,
        writeOffReason: data.writeOffReason,
        writeOffAmt: data.writeOffAmt,
        remarks: data.remarks
      });
    });
    this._waybillWriteOffService.postAlliedRetailWriteOfData(invoiceData, this.docType).subscribe(
      response => {
        this._spinner.hide();
        this._toastr.success('Allied Retail Write Off Successful');
        this.pickSearchData(this.clearSearch);

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
        this.dataSource.paginator.pageIndex = 0;
        this.dataSource.paginator.pageSize = 5;
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

