import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatPaginator, MatCheckboxChange, MatSort, MatDialog, MatSortable } from '@angular/material';
import { BillDetails } from '../../../models/BillDetails.model';
import { ReceiptService } from '../../../services/receipt.service';
import { ReceiptApplication } from '../../../models/receiptApplication.model';
import { DocumentSearch } from '../../../models/documentSearch.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ApplicationReasonComponent } from './application-reason/application-reason.component';
import { ReceiptDetailsWithId } from '../../../models/receiptDetailsById.model';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';

// for customer type
interface applyReason {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-document-result',
  templateUrl: './document-result.component.html',
  styleUrls: ['./document-result.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class DocumentResultComponent implements OnInit, AfterViewInit {
  todayDate: Date = new Date();
  dataSource: MatTableDataSource<BillDetails> = new MatTableDataSource();
  displayedColumns: string[] = ['select', 'documentNumber', 'documentDate', 'customerName', 'billingLevelCode', 'actualorAvail'
    , 'receiptFreightAmt', 'tdsAppliedAmt', 'gstTdsAppliedAmt', 'partAppliedReason', 'expectedCollDate'];
  selection = new SelectionModel(true, []);
  tempDataSource: BillDetails[];
  appArrayData: ReceiptApplication[] = [];
  reasonList: applyReason[] = [];
  private _addreason = 'ADD REASON';

  @Input()
  receiptById: ReceiptDetailsWithId;
  @Output() friegntUpdateEvent = new EventEmitter<number>();

  @Input()
  fileToUpload: File = null;

  childCurrentValue: DocumentSearch[] = [];
  documentType = '';
  documentNumber = '';
  fromDate = '';
  toDate = '';
  branchId = '';
  custId = '';
  callFlag ='N';
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private _receiptService: ReceiptService,
    public _toastr: ToastrService,
    private _router: Router,
    private _spinner: NgxSpinnerService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.getAllOutstandingBillsForCustomer();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sort(({ id: 'documentDate', start: 'asc'}) as MatSortable);
    this.dataSource.sort=this.sort;
  }
  // to convert system generated date for search in database
  convert(str) {
    if (str && this.documentType.includes('DEBIT')) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join('/');
    }
    if (str && this.documentType.includes('WAYBILL')) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join('-');
    } else if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  // initialise lookup
  // get the lookup values.
  initializeLookup() {
    if(this.callFlag === 'N'){
      this.callFlag='Y';
    }
    else{
        return;
    }
      this._receiptService.getLookupValuesByType('REC_PARTIAL_APPLY_RSN').subscribe(
        response => {
            response.data.forEach(
              lkps => {  
                this.reasonList = [...this.reasonList, { value: lkps.id, viewValue: lkps.descr }];
              });
        },
        error => {        
          this.handleError(error);
        });
  }

  getAllOutstandingBillsForCustomer() {
    console.log('getAllOutstandingBillsForCustomer');
    const custType = this.receiptById.custType;
    const customerId = this.receiptById.custId;
    if (custType != null) {
      // if credit, get the details from DBs- credit, allied, wms and cmdm
      if (custType.includes('CREDIT')) {
        // get credit bills
        this.documentType = 'CREDIT_BILL';
        this.custId = customerId;
        this.loadData('Y');
        // get wms bills
        this.documentType = 'WMS_BILL';
        this.custId = customerId;
        this.loadData('Y');
        // get allied-credit bills
        this.documentType = 'ALLIED_CREDIT_BILL';
        this.custId = customerId;
        this.loadData('Y');
        // get debit note
        this.documentType = 'DEBIT_BILL';
        this.custId = customerId;
        this.loadData('Y');
      } else if (custType.includes('PRC')) {
        console.log('in PRC');
        // get PAID
        this.documentType = 'PAID_WAYBILL';
        this.custId = customerId;
        this.loadData('Y');
        // TOPAY
        this.documentType = 'TOPAY_WAYBILL';
        this.custId = customerId;
        this.loadData('Y');
      } else if (custType.includes('PAID')) {
        // get PAID
        this.documentType = 'PAID_WAYBILL';
        this.custId = customerId;
        console.log(this.custId);
        this.loadData('Y');
      } else if (custType.includes('TOPAY') || custType.includes('TO_PAY')) {
        // get PAID
        this.documentType = 'TOPAY_WAYBILL';
        this.custId = customerId;
        this.loadData('Y');
      }
    }
  }

  // load bill details
  loadData(pageLoadFlag) {
    // get bill details
    this._spinner.show();     
    this._receiptService.getBillData(this.documentType, this.documentNumber,
      this.custId, this.convert(this.fromDate), this.convert(this.toDate)).subscribe(response => {
        if (pageLoadFlag === 'N') {
          this.dataSource = new MatTableDataSource(response);
          // reset the selection 
          this.selection = new SelectionModel(true, []);
          this.dataSource.data.forEach(value => {
            value.reason = this._addreason;
          });
          this.dataSource.paginator = this.paginator;    
          this.sort.sort((<MatSortable>{ id: 'documentDate', start: 'asc'}));
          this.dataSource.sort=this.sort;   
          this._spinner.hide();
        } else {
          if (response != null) {            
            response.forEach(value => {
              value.reason = this._addreason;
              this.dataSource.data.push(value);
            });
          }
          this._spinner.hide(); 
          this.dataSource = new MatTableDataSource(this.dataSource.data);
          this.dataSource.paginator = this.paginator;       
          this.sort.sort(({ id: 'documentDate', start: 'asc'}) as MatSortable);
          this.dataSource.sort=this.sort;   
        }
        // if not daat found show warning.
        if (this.dataSource != null && this.dataSource.data.length === 0 && pageLoadFlag === 'N') {
          this._toastr.warning('No Data found for the given document search criteria');
        }        
      },
        error => {
          this._spinner.hide();
          console.log(error);
          this.handleError(error);
        }
      );
      this.initializeLookup() ;
  }

  // show error details.
  handleError(error) {
    if (error.error != null) {
      const obj = JSON.parse(error.error);
      if (error.error.errorCode === 'handled_exception') {
        this._toastr.warning((obj.errorMessage));
      } else {
        this._toastr.warning(obj.errorMessage + ' Details: ' + obj.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }

  // this method will be called from search child component on search click
  getSearchVal(selected: any) {
    if (selected) {
      this.childCurrentValue = selected;
      // since single array will be there dirctly adding values
      this.custId = '';
      this.fromDate = this.childCurrentValue['fromDate'.toString()];
      this.toDate = this.childCurrentValue['toDate'.toString()];
      this.documentType = this.childCurrentValue['documentType'.toString()];
      this.documentNumber = this.childCurrentValue['documentNumber'.toString()] == null ? '' :
        this.childCurrentValue['documentNumber'.toString()];
      if (this.documentType.includes('CREDIT') && this.documentType.includes('ALLIED')) {
        this.documentType = 'ALLIED_CREDIT_BILL';
      } else if (this.documentType.includes('RETAIL') && this.documentType.includes('ALLIED')) {
        this.documentType = 'ALLIED_RETAIL_BILL';
      }
      //  call get method once varibales are assigned on click search from child
      this.loadData('N');
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
    this.appArrayData = [];
    this.selection.selected.forEach(data => {
      this.appArrayData.push({
        receiptApplnId: -1,
        receiptId: this.receiptById.receiptId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentId: data.documentId,
        documentDate: data.documentDate,
        appliedFrtAmt: data.appliedFrtAmt != null ? data.appliedFrtAmt : 0,
        appliedFrtTdsAmt: data.appliedFrtTdsAmt != null ? data.appliedFrtTdsAmt : 0,
        appliedGstTdsAmt: data.appliedGstTdsAmt != null ? data.appliedGstTdsAmt : 0,
        reason: data.reason,
        status: 'APPLY',
        expectedCollDt: data.expectedCollDt,
        attachedFileName:null
      });

      const appliedAmt = (data.appliedFrtAmt != null ? data.appliedFrtAmt : 0)
          + (data.appliedFrtTdsAmt != null ? data.appliedFrtTdsAmt : 0)
          + (data.appliedGstTdsAmt != null ? data.appliedGstTdsAmt : 0);
        console.log('appliedAmt : '+appliedAmt);
        console.log('data.outstandingAmount : '+data.outstandingAmount);
        // if the applied amount is less than receipt outstanding amount then collection date is mandatory.
        if (data.outstandingAmount - appliedAmt > 0 && 
            appliedAmt < this.receiptById.outstandingFrtAmt + this.receiptById.outstandingTdsAmt + this.receiptById.outstandingGstTdsAmt) {
          if (data.expectedCollDt == null) {
            this._toastr.warning('Expected Collection Date is mandatory');
          }
          if (data.reason == null || data.reason === this._addreason) {
            this._toastr.warning('Partially Applied Reason is mandatory');
          }
        }
        //if the applied amount is greater than the document outstanding amount then throw error
        if(appliedAmt > data.outstandingAmount){
          this._toastr.warning('You cannot apply more than the outstanding balance on the invoice: '+data.documentNumber);
        }
    });
  }

  // validate the receipt application
  validate() {
    let appliedFrtAmt = 0;
    let appliedFrtTdsAmt = 0;
    let appliedGstTdsAmt = 0;
    //const outStandingAmt = this.receiptById.outstandingFrtAmt + this.receiptById.outstandingTdsAmt + this.receiptById.outstandingGstTdsAmt;
    const receiptType = this.receiptById.custType;
    this.appArrayData.forEach(
      data => {
        // credit transactions cannot be applied on retail receipts.
        if (!receiptType.includes('CREDIT')) { // check if retail receipts
          // check if the applied document belongs to credit
          if (data.documentType.includes('CREDIT') || data.documentType.includes('WMS')) {
            this._toastr.warning('You cannot apply CREDIT invoice to RETAIL receipt');
          }
        }
        if (data.appliedFrtAmt != null) {
          appliedFrtAmt = appliedFrtAmt + data.appliedFrtAmt;
        }
        if (data.appliedFrtTdsAmt != null) {
          appliedFrtTdsAmt = appliedFrtTdsAmt + data.appliedFrtTdsAmt;
        }
        if (data.appliedGstTdsAmt != null) {
          appliedGstTdsAmt = appliedGstTdsAmt + data.appliedGstTdsAmt;
        }
        if (appliedFrtAmt === 0 && appliedFrtTdsAmt === 0 && appliedGstTdsAmt === 0) {
          this._toastr.warning('Mandatory to enter either frieght amount, TDS amount or GST TDS amount');
        }
        
      });
    if (appliedFrtAmt > this.receiptById.outstandingFrtAmt) {
      this._toastr.warning('Total Applied Freight Amount is greater than outstanding receipt freight amount');
    }
    if (appliedFrtTdsAmt > this.receiptById.outstandingTdsAmt) {
      this._toastr.warning('Total Applied TDS Amount is greater than outstanding receipt TDS amount');
    }
    if (appliedGstTdsAmt > this.receiptById.outstandingGstTdsAmt) {
      this._toastr.warning('Total Applied GST TDS Amount is greater than outstanding receipt GST TDS amount');
    }
  }

  // save the application details.
  save(): void {
    this.selectedBills();
    if (this.appArrayData.length > 0) {
      // validate the document application.
      this.validate();
      if (!this._toastr.currentlyActive) {
        let uploadStatus = true;
        let uploadMsg = null;
        this.appArrayData.forEach(
          data => {
            if (data.reason === this._addreason) {
              data.reason = null;
            }
            if (this.fileToUpload != null){
              const fileName = 'collections/application/'+this.receiptById.receiptNum + '_' + 'RECEIPT_APPLICATION' + '_' + this.fileToUpload.name;
              data.attachedFileName = fileName;
            }
          });
        console.log('application data: ');
        console.log(this.appArrayData);
        this._spinner.show();
        this._receiptService.postReceiptApplication(this.appArrayData).subscribe(
          response => {
            this._router.navigate(['collection/application-search']);
            if (this.fileToUpload != null) {
              const fileName = 'collections/application/'+this.receiptById.receiptNum + '_' + 'RECEIPT_APPLICATION' + '_' + this.fileToUpload.name;
              console.log('file name in :' + this.fileToUpload.name);
              this._receiptService.onUpload(this.fileToUpload, fileName).subscribe(
                () => {
                  uploadStatus = true;
                  this._toastr.success('Receipt Application Successful');
                },
                error => {
                  console.log(error);
                  this._spinner.hide();
                  uploadMsg = error;
                  uploadStatus = false;
                  this._toastr.warning('Receipt Application Successful and ' + this.fileToUpload.name + 'Failed to upload');
                }
              );
            }
            this._spinner.hide();
          },
          error => {
            this._spinner.hide();
            console.log(error);
            this.handleError(error);
          }
        );
      }

    } else {
      this._toastr.warning('Please select atleast one document for application');
    }

  }
  // navigate to application seach page.
  back(): void {
    this._router.navigate(['collection/application-search']);
  }

  // set reason
  setReason(row) {
    const dialogRef = this._dialog.open(ApplicationReasonComponent, { data: this.reasonList });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          row.reason = result[0].viewValue;
          if (row.expectedCollDt == null) {
            row.expectedCollDt = new Date();
          }
        }
      } else {
        // no action to be performed
      }
    });
  }
}
