import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerSearchRequest } from '../../models/customer-search-request.model';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { BillingCycle } from '../../models/billing-cycle.model';
import { BillingLevel } from '../../models/billing-level.model';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-create-manual-search',
  templateUrl: './create-manual-search.component.html',
  styleUrls: ['./create-manual-search.component.scss']
})
export class CreateManualSearchComponent implements OnInit {
  createFormGroup: FormGroup;

  @Input()
  public searchValues: CustomerSearchRequest = {} as CustomerSearchRequest;

  @Output() manualSearchVal: EventEmitter<any> = new EventEmitter<any>();

  blngCycleList: BillingCycle[] = [];
  blngLvlList: BillingLevel[] = [];
  blngCycleValue: string;
  type = null;


  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService) { }

  ngOnInit() {
    this.initForm();
    this.blngCyclelookup();
    this.blngLevelLookup();
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      billingCycleFC: new FormControl('', [Validators.required]),
      billngLevelFC: new FormControl('', [Validators.required]),
    });
  }

  refresh() {
    this.searchValues.type = null; 
    this.searchValues.autoBillFlag = null;
    this.searchValues.customerName = null;
    this.searchValues.msaCode = null;
    this.searchValues.sfxCode = null;
    this.createFormGroup.reset();
  }

  // billing level look up
  blngLevelLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.blngLvlList = [...this.blngLvlList, { blngLvlId: lkps.id, blngLvlValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  blngCyclelookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_CYCLE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.blngCycleList = [...this.blngCycleList, { blngCycleId: lkps.id, blngCycleValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // cust Type LookUp API
  custTypeLookUp() {
    this._lookupService.getLookupValuesByType('CUST_TYPE').subscribe(
      response => {
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === 'CREDIT') {
              this.searchValues.type = lkps.id;
              this.type = this.searchValues.type;
              this.pickSearchData(this.searchValues);
            }
          });
      },
      error => {
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

  // emits the data from child to parent table for search
  pickSearchData(searchData: any) {
    this.manualSearchVal.emit(searchData);
  }

  // to set the emitter values to parent
  pushValues() {
    this.custTypeLookUp();
  }
}
