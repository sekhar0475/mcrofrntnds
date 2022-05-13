import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatCheckboxChange } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ReceiptService } from '../../services/receipt.service';
import { AppliedReceipt } from '../../models/appliedReceipt.model';
import { UnapplyReason } from '../../models/unApplyReason.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReceiptApplication } from '../../models/receiptApplication.model';
import { ReceiptDetailsWithId } from '../../models/receiptDetailsById.model';

interface UnapplyList {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-unapplication',
  templateUrl: './unapplication.component.html',
  styleUrls: ['./unapplication.component.scss']
})
export class UnapplicationComponent implements OnInit, AfterViewInit {

  dataSource: MatTableDataSource<AppliedReceipt> = new MatTableDataSource();
  displayedColumns: string[] = ['select', 'documentNumber', 'documentDt', 'customerName', 'actualorAvail', 'billingLevelValue',
    'appliedFrtAmt', 'appliedFrtTdsAmt', 'appliedGstTdsAmt', 'reason', 'expectedColDt'];
  selection = new SelectionModel(true, []);
  selectedId: number;
  receiptById: ReceiptDetailsWithId;
  availFreightAmt: number;
  availTdsAmt: number;
  availGstTdsAmt: number;
  unapplicationFlag = false;
  childValue: UnapplyReason[] = [];
  unapplyReason = '';
  unappArrayData: ReceiptApplication[] = [];
  reasonList: UnapplyList[] = [];
  reason: UnapplyReason = {} as UnapplyReason;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private _route: ActivatedRoute
    , private _receiptService: ReceiptService
    , public _toastr: ToastrService
    , private _router: Router
    , private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.loadData();
    this.validateReason();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // validate reason null or not
  validateReason() {
    if (this.unapplyReason === '' || this.unapplyReason == null) {
      return true;
    } else {
      return false;
    }
  }

  // get data on page load.
  loadData() {
    this.selectedId = this._route.snapshot.params.id;
    // get receipt details.
    this._spinner.show();
    this.unApplyReasonLookup();
    this._receiptService.getReceiptDataById(this.selectedId, this.unapplicationFlag).subscribe(
      response => {
        this.receiptById = response;
        this.availFreightAmt = this.receiptById.outstandingFrtAmt;
        this.availGstTdsAmt = this.receiptById.outstandingGstTdsAmt;
        this.availTdsAmt = this.receiptById.outstandingTdsAmt;

        // get the document details.
        this._receiptService.getAppliedReceipts(this.selectedId).subscribe(response => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.ngAfterViewInit();
        },
          error => {
            this._spinner.hide();
            console.log(error);
            this.handleError(error);
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      }
    );
  }

  unApplyReasonLookup() {
    // get the lookup values.
    //  this._spinner.show();
    this._receiptService.getLookupValuesByType('REC_UNAPPLY_RSN').subscribe(
      response => {
        response.data.forEach(
          lkps => {
            this.reasonList = [...this.reasonList, { value: lkps.id, viewValue: lkps.descr }];
          });
        //  this._spinner.hide();
      },
      error => {
        //  this._spinner.hide();
        this.handleError(error);
      });

  }


  handleError(error) {
    console.log(error);
    if (error.error != null && error.error.errorCode != null) {
      this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
    } else {
      this._toastr.warning(error.message);
    }
  }
  /** Whether the number of selected elements matches the total number of rows. */
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

  // get selected rows and create the object
  selectedBills() {
    this.selection.selected.forEach(data => {
      this.unappArrayData.push({
        receiptApplnId: data.receiptAplnId,
        receiptId: this.selectedId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentId: data.documentId,
        documentDate: data.documentDate,
        appliedFrtAmt: data.appliedFrtAmt != null ? data.appliedFrtAmt : 0,
        appliedFrtTdsAmt: data.appliedFrtTdsAmt != null ? data.appliedFrtTdsAmt : 0,
        appliedGstTdsAmt: data.appliedGstTdsAmt != null ? data.appliedGstTdsAmt : 0,
        reason: this.unapplyReason,
        status: 'UNAPPLY',
        expectedCollDt: data.expectedCollDt,
        attachedFileName: null
      });
    });
  }

  // post data to database for un apply
  save(): void {
    this.selectedBills();
    if (this.unappArrayData.length > 0) {
      this._spinner.show();
      console.log(this.unappArrayData);
      this._receiptService.postReceiptUnapply(this.unappArrayData).subscribe(response => {
        this._spinner.hide();
        this._toastr.success('Receipt Unapplication successful.');
        this._router.navigate(['collection/unapplication-search']);
      },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error != null && error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        });
    } else {
      // nothing
    }
  }

  // on clicking back button
  back() {
    this._router.navigate(['collection/unapplication-search']);
  }

}
