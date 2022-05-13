import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReviewSearch } from '../../models/review-search.model';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { BillingBatchType } from '../../models/bill-batch-type.model';
import { BillingBatchStatus } from '../../models/batch-status.model';
import { BillingBatchLevel } from '../../models/billing-level.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReviewService } from '../../services/review.service';
import { ReviewSearchParams } from '../../models/review-search-params.model';

@Component({
  selector: 'app-review-search',
  templateUrl: './review-search.component.html',
  styleUrls: ['./review-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class ReviewSearchComponent implements OnInit {

  // to set the values of text fields
  @Input()
  public searchValues: ReviewSearch = {} as ReviewSearch;
  @Output()
  reviewSearchVal: EventEmitter<any> = new EventEmitter<any>();

  billTypelist: BillingBatchType[] = [];
  batchStatusList: BillingBatchStatus[] = [];
  billLevelList: BillingBatchLevel[] = [];

  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _reviewService: ReviewService
  ) { }

  ngOnInit() {
    this.batchTypeLookup();
    this.batchStatusLookup();
    this.blngLevelLookup();

    if(Object.entries(this._reviewService.searchParams).length !== 0) {
      let batchType = this._reviewService.searchParams.batchTy
      let batchStatus = this._reviewService.searchParams.batchStatus;
      let billingLevel = this._reviewService.searchParams.blngLevel;
      let billingLevelCode = this._reviewService.searchParams.blngLevelCode;
      let fromDate = this._reviewService.searchParams.fromDt;
      let toDate = this._reviewService.searchParams.toDt
      let batchNum = this._reviewService.searchParams.batchNum;

      this.searchValues.billBatchType = batchType ? batchType : null;
      this.searchValues.batchStatus = batchStatus ? batchStatus : null;
      this.searchValues.blngLevel = billingLevel ? billingLevel : null;
      this.searchValues.blngLevelCode = billingLevelCode ? billingLevelCode : null;
      this.searchValues.fromDate = fromDate ? new Date(fromDate) : null;
      this.searchValues.toDate = toDate ? new Date(toDate) : null;
      this.searchValues.batchNum = batchNum ? parseInt(batchNum) : null;

      this._reviewService.searchParams = {} as ReviewSearchParams;
    }
  }
  // batch type lookup value
  batchTypeLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILL_BATCH_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.billTypelist = [...this.billTypelist, { blngTypeId: lkps.id, blngTypeValue: lkps.lookupVal  }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // billing level look up
  blngLevelLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.billLevelList = [...this.billLevelList, { blngLvlId: lkps.id, blngLvlValue: lkps.lookupVal  }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  batchStatusLookup() {
    this._spinner.show();
    
   // this._lookupService.getLookupValuesByType('BILL_BATCH_STATUS').subscribe(
    this._lookupService.getLookupValuesByType('CREDIT_BILL_BATCH_STATUS').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.batchStatusList = [...this.batchStatusList, { blngBatchId: lkps.id, blngBatchValue: lkps.lookupVal ,blngBatchDscr: lkps.descr }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }


  // show error details.
  handleError(error: any) {
    if (error.error != null && error.error.errorMessage != null) {
      this._toastr.warning(error.error.errorMessage);
    } else {
      this._toastr.warning(error.message);
    }
  }

  // emits the data from child to parent table for search
  pickSearchData(searchData: any) {
    this.reviewSearchVal.emit(searchData);
  }

  // to set the emitter values to parent
  pushValues() {
    this.pickSearchData(this.searchValues);
  }

}
