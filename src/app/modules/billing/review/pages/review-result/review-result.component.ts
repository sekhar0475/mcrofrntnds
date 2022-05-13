import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Review } from '../../models/review.model';
import { ReviewSearch } from '../../models/review-search.model';
import { ReviewService } from '../../services/review.service';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { RemoveBatch } from '../../models/remove-batch.model';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { ErrorReportModel } from '../../models/error-batch-detail.model';
import { ReviewSearchParams } from '../../models/review-search-params.model';


@Component({
  selector: 'app-review',
  templateUrl: './review-result.component.html',
  styleUrls: ['./review-result.component.scss']
})
export class ReviewResultComponent implements OnInit, AfterViewInit {
  reviewData: Review;
  childValue: ReviewSearch[] = [];
  billBatchType = '';
  batchStatus = '';
  blngLevel = '';
  blngLevelCode = '';
  fromDate = '';
  toDate = '';
  batchNum = '';
  writeAccess = false;
  editAccess = false;
  rejectionId = null;
  rejectionType = null;
  errorMessage: ErrorMsg;
  removeBatchArry: RemoveBatch[] = [];
  clearSearchValues: ReviewSearch = {} as ReviewSearch;
  displayedColumns: string[] = ['select', 'batchNum', 'phase','status', 'batchType', 'requestDt', 'billingCycle', 'createdBy', 'download', 'action'];
  dataSource: MatTableDataSource<Review> = new MatTableDataSource();
  selection = new SelectionModel<Review>(true, []);
  emptyData: Review[] = [];

  mappedDataSource: MatTableDataSource<ErrorReportModel> = new MatTableDataSource();
  excelHeaders: string[] = ['Batch Number'
    , 'Batch Detail Id'
    , 'Customer Name'
    , 'Alias'
    , 'Billing Level'
    , 'Billing Level Code'
    , 'Billing By'
    , 'Billing Branch'
    , 'Sfx Code'
    , 'Sfx Ids'
    , 'Rate Card'
    , 'Consigner Name'
    , 'Consinee Name'
    , 'status'
    , 'message'
  ];

  workSheetName = 'Error Batch Details';
  fileName = 'ErrorBatchDetails';

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _reviewService: ReviewService,
    private _tokenStorage: TokenStorageService,
    private _exportToService: ExportToExcelService
  ) { }

  ngOnInit() {
    this.setPermissions();
    if(Object.entries(this._reviewService.searchParams).length !== 0) {
      this.billBatchType = this._reviewService.searchParams.batchTy;
      this.batchStatus = this._reviewService.searchParams.batchStatus;
      this.blngLevel = this._reviewService.searchParams.blngLevel;
      this.blngLevelCode = this._reviewService.searchParams.blngLevelCode;
      this.fromDate = this._reviewService.searchParams.fromDt;
      this.toDate = this._reviewService.searchParams.toDt;
      this.batchNum = this._reviewService.searchParams.batchNum;

      this.loadData();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // to convert system generated date for search in database
  convert(str: string) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  // load data for on page load
  loadData() {
    this._spinner.show();
    // if selected array has any data clear array on search
    this.selection.clear();
    this._reviewService.getReviewData(this.billBatchType, this.batchStatus, this.blngLevel
      , this.blngLevelCode, this.convert(this.fromDate), this.convert(this.toDate), this.batchNum).subscribe(
        response => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          // this.dataSource.paginator = this.paginator;
          this.ngAfterViewInit();
          if (this.dataSource.data.length === 0) {
            this._toastr.warning('No Data Found');
          }
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        });

    this.rejectionTypeLookUp();
  }

  // rejection type LookUp API
  rejectionTypeLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('REJECTION_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === 'FULL') {
              this.rejectionId = lkps.id;
              this.rejectionType = lkps.lookupVal;
              console.log(this.rejectionId);
            }
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
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
  // this method will be called from search child component on search click
  getSearchVal(selected: any) {
    if (selected) {
      this.childValue = selected;
      console.log(selected);
      // since single array will be there dirctly adding values
      this.billBatchType = this.childValue['billBatchType'.toString()] == null ? '' : this.childValue['billBatchType'.toString()];
      this.batchStatus = this.childValue['batchStatus'.toString()] == null ? '' : this.childValue['batchStatus'.toString()];
      this.blngLevel = this.childValue['blngLevel'.toString()] == null ? '' : this.childValue['blngLevel'.toString()];
      this.blngLevelCode = this.childValue['blngLevelCode'.toString()] == null ? '' : this.childValue['blngLevelCode'.toString()];
      this.fromDate = this.childValue['fromDate'.toString()];
      this.toDate = this.childValue['toDate'.toString()];
      this.batchNum = this.childValue['batchNum'.toString()] == null ? '' : this.childValue['batchNum'.toString()];

      this._reviewService.searchParams.batchNum = this.batchNum;
      this._reviewService.searchParams.batchStatus = this.batchStatus;
      this._reviewService.searchParams.batchTy = this.billBatchType;
      this._reviewService.searchParams.blngLevel = this.blngLevel;
      this._reviewService.searchParams.blngLevelCode = this.blngLevelCode;
      this._reviewService.searchParams.fromDt = this.fromDate;
      this._reviewService.searchParams.toDt = this.toDate;

      //  call get method once varibales are assigned on click search from child
      this.loadData();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    let numDisabledRows = this.dataSource.data.filter(row=>this.checkBatchPhase(row.phase)).length;
    return numSelected+numDisabledRows === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => {
        if(!this.checkBatchPhase(row.phase)){
        this.selection.select(row);
        }
      })

  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Review): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.billBatchId + 1}`;
  }

  gotoBatchReview(batchId: number, batchNum: string) {
    this._router.navigate(['billing/batchReview', batchId + '-' + batchNum]);
  }

  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // page refresh.
        this.dataSource.paginator.pageIndex = 0;
        this.dataSource.paginator.pageSize = 5;
        this.selection.clear();
        this.clearSearch();
        this.clearSearchChild();
        this.dataSource = new MatTableDataSource(this.emptyData);
      } else {
        // do nothing.
      }
    });
  }

  // to clear values of search
  clearSearch() {
    this.billBatchType = null;
    this.batchStatus = null;
    this.blngLevel = null;
    this.blngLevelCode = null;
    this.fromDate = null;
    this.toDate = null;
    this.batchNum = null;
  }


  // on sumbit
  submit(): void {
    if (this.selection.selected.length === 0) {
      this._toastr.warning('No transaction/changes available to commit to database.');
    } else {
      this.dataValidation(this.selection.selected);
      if (!this._toastr.currentlyActive) {
        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
          data: 'Please confirm if you want to proceed further?'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog sent: ${result}`);
          if (result) {
            // POST data into database
            this.postReviewData();
          } else {
            // do nothing.
          }
        });
      }
    }
  }
  // post data to data base
  postReviewData() {
    if (this.selection.selected.length > 0) {
        this._spinner.show();
        this._reviewService.postSelectedBatch(this.selection.selected).subscribe(
          response => {
            this._spinner.hide();
            this._toastr.success(response);
            this.selection.clear();
            this.clearSearch();
            this.clearSearchChild();
            this.dataSource = new MatTableDataSource(this.emptyData);
          },
          error => {
            this._spinner.hide();
            this.handleStringError(error);
          });
      }
    }


  //data validation for confirmation.
  dataValidation(selectedbatch: Review[]) {
    let i = 0;
    let isErrorBatch = false;
    let errMsg = '';
    for (i = 0; i < selectedbatch.length; i++) {
      if (selectedbatch[i].status === 'ERROR') {
        isErrorBatch = true;
        errMsg = 'Errored Batch not Allowed for Confimation'
      }
      if (selectedbatch[i].phase === 'REQUESTED') {
        isErrorBatch = true;
        errMsg = 'Batch in Requested Phase not Allowed for Confimation/Rejection'
      }
    }
    if (isErrorBatch) {
      this._toastr.error(errMsg)
    }
  }

  // clear search criteria values
  clearSearchChild() {
    this.clearSearchValues = {
      billBatchType: null,
      batchStatus: null,
      blngLevel: null,
      blngLevelCode: null,
      fromDate: null,
      toDate: null,
      batchNum: null
    }
  }
  // on click reject
  rejectSubmit() {
    if (this.selection.selected.length === 0) {
      this._toastr.warning('No transaction/changes available to commit to database.');
    } else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'This Action will Reject the Batch, are you sure?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          // POST data into database
          this.rejectBatch();
        } else {
          // do nothing.
        }
      });
    }
  }

  // to reject the batch
  rejectBatch() {
    this.removeBatchArry = [];
    if (this.selection.selected.length > 0) {
      this.selection.selected.forEach(batch => {
        this.removeBatchArry.push({
          batchId: batch.billBatchId,
          msaId: null,
          ratecardId: null,
          rejectionTypeId: this.rejectionId,
          sfxId: null,
          waybillNumber: []
        });
      });
      this._spinner.show();
      this._reviewService.postRejectedWayBillsorBatch(this.removeBatchArry, this.rejectionType).subscribe(
        response => {
          this._toastr.success("Batch Rejected Successfully");
          this.selection.clear();
          this.clearSearch();
          this.clearSearchChild();
          this.dataSource = new MatTableDataSource(this.emptyData);
          this._spinner.hide();

        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        });
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

  // check if batch is success
  checkBatchStatus(status: string) {
    if ('SUCCESS' === status) {
      return false;
    } else {
      return true;
    }
  }

  // check if batch is initiated
  checkBatchPhase(phase: string) {
    if ('INITIATE' === phase) {
      return false;
    } else {
      return true;
    }
  }
  // check if batch is success
  checkBatchStatusIfError(status: string) {
    if ('ERROR' === status) {
      return false;
    } else {
      return true;
    }
  }

  // call data base data for excel report
  generateExcelReport(billBatchId: number) {
    this._spinner.show();
    this._reviewService.getErrorBatchDetails(billBatchId).subscribe(
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
        if (error.error.errorCode != null) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }
  // to download excel of batch details
  excelDownload(response: any) {
    this.mappedDataSource = new MatTableDataSource(response);
    const excelData = this.mappedDataSource.data.map((obj) => ([obj.batchNum,
    obj.batchDetailId,
    obj.msaName,
    obj.alias,
    obj.billingLevel,
    obj.billingLevelCode,
    obj.billingBy,
    obj.blngBr,
    obj.sfxCode,
    obj.sfxIds,
    obj.rateCard,
    obj.consignerName,
    obj.consineeName,
    obj.status,
    obj.message]));
    this._exportToService.export2Excel(this.excelHeaders, this.workSheetName, excelData, this.fileName);
  }
}
