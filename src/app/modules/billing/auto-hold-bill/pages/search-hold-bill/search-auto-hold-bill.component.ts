import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HoldStatus } from '../../models/hold-status.model';
import { ToastrService } from 'ngx-toastr';
import { SearchCustomer } from '../../models/seach-customers.model';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-search-auto-hold-bill',
  templateUrl: './search-auto-hold-bill.component.html',
  styleUrls: ['./search-auto-hold-bill.component.scss']
})
export class SearchAutoHoldBillComponent implements OnInit {

  holdList: HoldStatus[] = [];

  @Input() searchValues: SearchCustomer = {} as SearchCustomer;
  @Output() holdSearchVal: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService) { }

  ngOnInit() {
    this.holdStatusLookUp();
    this.custTypeLookUp();
  }
  // hold status look up API
  holdStatusLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('HOLD_STATUS').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.holdList = [...this.holdList, { holdId: lkps.id, holdStatus: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // cust Type LookUp API
  custTypeLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('CUST_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === 'CREDIT') {
              this.searchValues.custTypeId = lkps.id;
            }
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
    this.holdSearchVal.emit(searchData);

  }

  // to set the emitter values to parent
  pushValues() {
    this.pickSearchData(this.searchValues);
  }

  refresh(){
    this.searchValues.holdStatus = null;
    this.searchValues.customerName= null;
    this.searchValues.msaCode= null;
    this.searchValues.sfxCode= null;
    this.searchValues.custTypeId= null;
  }
}
