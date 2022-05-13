import { Component, OnInit, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatCheckboxChange, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Finalize } from '../../models/finalize.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { FinalizeBatchService } from '../../services/finalize-batch.service';
import { FinalizeSearch } from '../../models/finalize-search.model';
import { ReportDetail } from '../../models/batch-detail-report.model';
import { FinalizeBatch } from '../../models/finalize-batch.model';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { AutoLogoutService } from 'src/app/core/autoLogOutService';

@Component({
  selector: 'app-finalize',
  templateUrl: './finalize.component.html',
  styleUrls: ['./finalize.component.scss']
})

export class FinalizeComponent implements OnInit, AfterViewInit, OnChanges {

  displayedColumns: string[] = ['select', 'batchNum', 'phase', 'batchType', 'requestDt', 'billingCycle', 'createdBy', 'download'];

  dataSource: MatTableDataSource<Finalize> = new MatTableDataSource();
  selection = new SelectionModel<Finalize>(true, []);

  finalizedDataArray: FinalizeBatch[] = [];
  tempDataSource: Finalize[];
  errorArr: string[] = [];
  finalizeEmptyArr: Finalize[] = [];
  errorMessage: ErrorMsg;

  mappedDataSource: MatTableDataSource<ReportDetail> = new MatTableDataSource();

  excelHeaders: string[] = ['Customer Name'
    , 'Batch No'
    , 'Bill No'
    , 'MSA'
    , 'Sfx'
    , 'Rate Card'
    , 'Freight Amount'
    , 'CGST'
    , 'SGST'
    , 'IGST'
    , 'Total Tax Amount'
    , 'Invoice Amount'
    , 'Billing Cycle'
    , 'Billing By'
    , 'Billing Branch'
    , 'Submission Branch'
    , 'Collection Branch'
    , 'Waybill Count'
  ];

  workSheetName = 'Batch Details';
  fileName = 'BatchDeatilsFinalize';
  childCurrentValue: FinalizeSearch[] = [];
  fromDate = '';
  toDate = '';
  batchNumber = '';
  writeAccess = false;
  editAccess = false;
  clearSearchValues: FinalizeSearch = {} as FinalizeSearch;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _tokenStorage: TokenStorageService,
    private _finalizeService: FinalizeBatchService,
    private _exportToService: ExportToExcelService) { }


  ngOnInit() {
    // on page load call loadData
    this.setPermissions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // to convert system generated date for search in database
  convert(str) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  // load data from data base
  loadData() {
    const fromDate = this.convert(this.fromDate);
    const toDate = this.convert(this.toDate);
    const batchNumber = this.batchNumber;
    this._spinner.show();
    this._finalizeService.getFinalizeData(fromDate, toDate, batchNumber).subscribe(
      response => {
        this.selection.clear();
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.tempDataSource = [];
        this.tempDataSource = this.dataSource.data.map(row => Object.assign({}, row));
        this.ngAfterViewInit();
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('No Data Found');
        }
      },
      error => {
        // show error details.
        console.log(error);
        this._spinner.hide();
        this.handleStringError(error);
      }
    );
  }


  // this method will be called from search child component on search click
  getSearchVal(selected: any) {
    if (selected) {
      this.childCurrentValue = selected;

      // since single array will be there dirctly adding values
      this.fromDate = this.childCurrentValue['fromDate'.toString()];
      this.toDate = this.childCurrentValue['toDate'.toString()];
      this.batchNumber = this.childCurrentValue['batchNum'.toString()] == null ? '' : this.childCurrentValue['batchNum'.toString()];

      //  call get method once varibales are assigned on click search from child
      this.loadData();
    }
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Finalize): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  // /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.dataSource.data ? this.dataSource.data.filter(data => data.phase === 'FINALIZED').length : 0;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }
  // // to toggle the header checkbox.
  // customToggle(eventValue: MatCheckboxChange) {
  //   if (eventValue.checked) {
  //     this.dataSource.data.forEach(row => this.selection.select(row));
  //     this.dataSource.data.forEach(row => row.phase = 'FINALIZED');
  //     this.finalizedDataArray = [];
  //     this.dataSource.data.forEach(row => this.addAllArrayWithFinalized(row));

  //   } else {
  //     this.selection.clear();
  //     this.dataSource.data.forEach(row => row.phase = 'PENDING_FINALIZATION');
  //     this.finalizedDataArray = [];
  //   }
  // }
  // addAllArrayWithFinalized(dataRow: Finalize) {
  //   let i = 0;
  //   for (i = 0; i < this.tempDataSource.length; i++) {
  //     if (this.tempDataSource[i].billBatchId === dataRow.billBatchId) {
  //       this.finalizedDataArray.push({
  //         billBatchId: this.tempDataSource[i].billBatchId,
  //         status: dataRow.phase
  //       });
  //     }
  //   }
  // }
  // checkIfFinalized(dataRow: Finalize) {
  //   if (dataRow.phase != null && dataRow.phase === 'FINALIZED') {
  //     return 'checked';
  //   } else {
  //     return false;
  //   }
  // }

  // // if there's change in status.
  // changeRow(row: Finalize, value: MatCheckboxChange) {
  //   if (value.checked) {
  //     row.phase = 'FINALIZED';
  //   } else {
  //     row.phase = 'CONFIRMED';
  //   }
  //   let i = 0;
  //   for (i = 0; i < this.tempDataSource.length; i++) {
  //     if (this.tempDataSource[i].billBatchId === row.billBatchId && this.tempDataSource[i].phase !== row.phase) {
  //       this.remove(row);
  //       this.addArray(row);

  //     }
  //     if (this.tempDataSource[i].billBatchId === row.billBatchId && this.tempDataSource[i].phase === row.phase) {
  //       this.remove(row);
  //     }
  //   }
  // }
  // // add the details into finalized array
  // addArray(row: Finalize) {
  //   let i = 0;
  //   let flag = 0;
  //   // check if this data is already available in the finalizedDataArray
  //   for (i = 0; i < this.finalizedDataArray.length; i++) {
  //     if (this.finalizedDataArray[i].billBatchId === row.billBatchId || this.finalizedDataArray[i].status === 'CONFIRMED') {
  //       flag = 1;
  //       break;
  //     }
  //   }
  //   if (flag === 0) {
  //     this.finalizedDataArray.push({
  //       billBatchId: row.billBatchId,
  //       status: row.phase
  //     });
  //   }
  // }


  // // remove if already exist in th array
  // remove(row: Finalize) {
  //   let i = 0;
  //   for (i = 0; i < this.finalizedDataArray.length; i++) {
  //     if (this.finalizedDataArray[i].billBatchId === row.billBatchId) {
  //       this.finalizedDataArray.splice(i, 1);
  //     }
  //   }
  // }

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
        this.selection.clear();
        this.clearSearchValues = {} as FinalizeSearch;
        this.finalizedDataArray = [];
        this.fromDate = null;
        this.toDate = null;
        this.batchNumber = null;
        this.dataSource = new MatTableDataSource(this.finalizeEmptyArr);
      } else {
        // do nothing.
      }
    });
  }

  // to save data to database
  submit(): void {
    if (this.selection.selected.length === 0) {
      this._toastr.warning('No transaction/changes available to commit to database.');
    } else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'This action will finalize the batch and is an irreversible change, do you want to continue?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          this.tempDataSource = this.dataSource.data;
          this.postFinalizedData();
        } else {
          // do nothing.
        }
      });
    }
  }
  // post data to data base
  postFinalizedData() {
    if (this.selection.selected.length > 0) {
      this.finalizedDataArray = [];
      this.selection.selected.forEach(data => {
        this.finalizedDataArray.push({
          billBatchId: data.billBatchId,
          status: 'FINALIZED'
        });
      });
      this._spinner.show();
      this._finalizeService.postFinalizedData(this.finalizedDataArray).subscribe
        (
          response => {
            this.selection = new SelectionModel<Finalize>(true, []);
            this.clearSearchValues = {} as FinalizeSearch;
            this.finalizedDataArray = [];
            this._toastr.success(response);
            this.dataSource = new MatTableDataSource(this.finalizeEmptyArr);
            this._spinner.hide();
          },
          error => {
            this._spinner.hide();
            this.handleStringError(error);
          }
        );
    }
  }

  // call data base data for excel report
  generateExcelReport(billBatchId: number) {
    this._spinner.show();
    this._finalizeService.getBatchDetails(billBatchId).subscribe(
      response => {
        this._spinner.hide();
        if (response) {
          // sending response for export to excel option.
          this.excelDownload(response);
        }
      },
      error => {
        // show error details.
        this._spinner.hide();
        this.handleError(error);
      }
    );
  }

  // to download excel of batch details
  excelDownload(response: any) {
    this.mappedDataSource = new MatTableDataSource(response);
    const excelData = this.mappedDataSource.data.map((obj) => ([obj.custname,
    obj.batchNum,
    obj.billNum,
    obj.msa,
    obj.sfx,
    obj.rateCard,
    obj.frgtAmount,
    obj.cgstAmt,
    obj.sgstAmt,
    obj.igstAmt,
    obj.taxAmount,
    obj.invoiceAmount,
    obj.blngCycle,
    obj.blngBy,
    obj.blngBranch,
    obj.submsnBranch,
    obj.collBranch,
    obj.wayBillCount]));
    this._exportToService.export2Excel(this.excelHeaders, this.workSheetName, excelData, this.fileName);
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


