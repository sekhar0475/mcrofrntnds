import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { BillingBatchLevel } from '../../models/billing-level.model';
import { CustomerData } from '../../models/customer-data.model';
import { RemoveWayBill } from '../../models/remove-waybill.model';
import { SearchCustomerForReview } from '../../models/search-customer.model';
import { SearchWayBillByBatch } from '../../models/search-waybill.model';
import { WayBillsData } from '../../models/waybill-response.model';
import { ReviewService } from '../../services/review.service';


@Component({
  selector: 'app-batch-review',
  templateUrl: './batch-review.component.html',
  styleUrls: ['./batch-review.component.scss']
})
export class BatchReviewComponent implements OnInit {

  paramBatchNumber: string;
  paramBatchId: number;
  params: string;
  paramsArr: string[] = [];
  blngLevelId: number;
  createFormGroup: FormGroup;
  customerResponse: CustomerData[] = [];
  billingLevelList: BillingBatchLevel[] = [];
  wayBillNumbers = null;
  removedLine: WayBillsData[];
  removedCustomer: CustomerData[];
  removeCustomerArry: RemoveWayBill[] = [];
  removeWaybillArry: RemoveWayBill[] = [];
  removeWayBills: RemoveWayBill[] = [];
  rejectionId = null;
  rejectionType = null;
  errorMessage: ErrorMsg;
  searchWayBill: SearchWayBillByBatch = {} as SearchWayBillByBatch;
  displayedColumns: string[] = ['customerName', 'msaCode', 'sfxCode', 'rateCard', 'remove'];
  displayedWayBillColumns: string[] = ['waybillNumber', 'sfxCode', 'pickupDate', 'originCode', 'destinationCode'
    , 'pkg', 'weight', 'outstandingAmount', 'remove'];
  searchCustomer: SearchCustomerForReview = {} as SearchCustomerForReview;
  dataSource: MatTableDataSource<CustomerData> = new MatTableDataSource();
  matDataSource: MatTableDataSource<WayBillsData> = new MatTableDataSource();

  isWaybillValuesAvailable: boolean = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _route: ActivatedRoute,
    private _spinner: NgxSpinnerService,
    private _reviewService: ReviewService,
    private _lookupService: LookupService) { }

  ngOnInit() {
    this.blngLevelLookup();
    this.loadData();
    this.initForm();
    this.rejectionTypeLookUp();
  }

  loadData() {
    this.params = this._route.snapshot.params.id;
    this.paramsArr = this.params.split('-');
    this.paramBatchId = Number(this.paramsArr[0]);
    this.searchCustomer.batchId = Number(this.paramsArr[0]);
    this.searchCustomer.batchNumber = this.paramsArr[1];
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      billingLevelFC: new FormControl('', [Validators.required]),
      blngLvlCodeFc: new FormControl('', [Validators.required]),
      wayBillNumberFc: new FormControl(''),
    });
  }

  // to set billing level and billing id for customer search
  setBillingLevel(level) {
    this.billingLevelList.forEach(data => {
      if (level !== undefined && data.blngLvlValue === level.blngLvlValue) {
        this.blngLevelId = data.blngLvlId;
        this.searchCustomer.blngLvlId = data.blngLvlId;
      }
    });
  }

  // billing level lookup
  blngLevelLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.billingLevelList = [...this.billingLevelList, { blngLvlId: lkps.id, blngLvlValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // rejection type LookUp API
  rejectionTypeLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('REJECTION_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === 'PARTIAL') {
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
  // to customer based on billing level
  findBilingLevel() {
    const batchId = this.searchCustomer.batchId;
    const blngLevelId = this.searchCustomer.blngLvlId;
    const blngLevelCode = this.searchCustomer.blngLvlcode;
    this._spinner.show();
    this._reviewService.getBillingLevelforReview(batchId, blngLevelId, blngLevelCode.toUpperCase()).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.customerResponse = response;
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('No Data Found for Customer ' + blngLevelCode.toUpperCase());
        }
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // to call way bill api
  callWayBillGet() {
    const wayBills = this.createFormGroup.get('wayBillNumberFc').value;
    if (wayBills == null || wayBills === '') {
      this.wayBillNumbers = [];
    } else {
      this.wayBillNumbers = wayBills.split(',');
    }
    this.searchWayBill = ({
      batchId: this.paramBatchId,
      waybillNumbers: this.wayBillNumbers
    });

    if (this.searchWayBill) {
      const newjson = JSON.stringify(this.searchWayBill);
      console.log(newjson);
      this._spinner.show();
      this._reviewService.getBatchReviewWayBills(this.searchWayBill).subscribe(
        response => {
          this._spinner.hide();
          console.log(response.data['waybills']);
          this.matDataSource = new MatTableDataSource(response.data['waybills']);
          this.matDataSource.sort = this.sort;
          if (this.matDataSource.data.length === 0) {
            this._toastr.warning('No Data Found');
          }
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    }
  }

  // push data to main array for rejection of waybill and customer
  pushInRejectArray(removeArray: RemoveWayBill[]) {
    removeArray.forEach(data => {
      this.removeWayBills.push({
        batchId: data.batchId,
        msaId: data.msaId,
        ratecardId: data.ratecardId,
        rejectionTypeId: data.rejectionTypeId,
        sfxId: data.sfxId,
        waybillNumber: data.waybillNumber
      });
    });

  }

  // to remove customer from customer result table
  removeCustomerFromAray(index: number) {
    this.removeCustomerArry = [];
    this.removedCustomer = [];
    this.removedCustomer = this.dataSource.data.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.removedCustomer.forEach(data => {
      this.removeCustomerArry.push({
        batchId: this.paramBatchId,
        msaId: data.msaId,
        ratecardId: data.rateCardId,
        rejectionTypeId: this.rejectionId,
        sfxId: data.sfxId,
        waybillNumber: [null]
      });
    });
    this.pushInRejectArray(this.removeCustomerArry);
  }

  // remove way bill from the way bill table
  removeWayBillFromArray(waybillId: number, index: number) {
    this.removeWaybillArry = [];
    this.removedLine = [];
    this.removedLine = this.matDataSource.data.splice(index, 1);
    this.matDataSource = new MatTableDataSource(this.matDataSource.data);
    this.removedLine.forEach(data => {
      this.removeWaybillArry.push({
        batchId: this.paramBatchId,
        msaId: null,
        ratecardId: null,
        rejectionTypeId: this.rejectionId,
        sfxId: null,
        waybillNumber: [data.waybillNumber]
      });
    });
    this.pushInRejectArray(this.removeWaybillArry);
  }


  back() {
    // on clicking back
    if(this.createFormGroup.dirty && this.removeWayBills.length > 0) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Unsaved data will be lost. Please confirm whether you want to continue?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          this.removeWayBills = [];
          this._router.navigate(['/billing/review']);
          // this._reviewService.back();
        } else {
          // do nothing.
        }
      });
    }
    else {
      this.removeWayBills = [];
      this._router.navigate(['/billing/review']);
    }
  }

  cancel() {
    // on clicking back
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Unsaved data will be lost. Please confirm whether you want to continue?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        this.removeWayBills = [];
        this.dataSource = new MatTableDataSource(null);
        this.matDataSource = new MatTableDataSource(null);
        this.billingLevelList = [];
        this.createFormGroup.reset();
        this.blngLevelLookup();
      } else {
        // do nothing.
      }
    });
  }

  // to save data to database
  submit() {
    if (this.removeWayBills.length === 0) {
      this._toastr.warning('No transaction/changes available to commit to database.');
    } else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Do you want to Continue With Waybill Removal from Batch?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          this.postRejectWayBills();
        } else {
          // do nothing.
        }
      });
    }
  }

  // to save rejected dta
  postRejectWayBills() {
    this._spinner.show();
    this._reviewService.postRejectedWayBillsorBatch(this.removeWayBills, this.rejectionType).subscribe(
      response => {
        this._toastr.success("Batch Waybills Rejected Successfully");
        this.loadData();
        this._spinner.hide();
      }, error => {
        this._spinner.hide();
        this.handleStringError(error);
      }
    );
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

  checkWaybillValue() {
    if(null != this.createFormGroup.get('wayBillNumberFc').value && this.createFormGroup.get('wayBillNumberFc').value != '') {
      this.isWaybillValuesAvailable = true;
    }
    else {
      this.isWaybillValuesAvailable = false;
    }
  }
}

