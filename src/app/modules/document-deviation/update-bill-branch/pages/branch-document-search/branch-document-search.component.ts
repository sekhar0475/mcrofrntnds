import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { BillTypeLov } from '../../models/bill-type-lov.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { SearchBillData } from '../../models/search-bill.model';

@Component({
  selector: 'app-branch-document-search',
  templateUrl: './branch-document-search.component.html',
  styleUrls: ['./branch-document-search.component.scss']
})
export class BranchDocumentSearchComponent implements OnInit {

  billTypeList: BillTypeLov[] = [];
  searchFormGroup: FormGroup;
  searchData: SearchBillData;
  displayBillBranchComponent = false; // to display result component
  constructor(
      private _toastr: ToastrService,
      private _spinner: NgxSpinnerService,
      private _lookupService: LookupService) { }


  ngOnInit() {
    this.billTypeLookup();
    this.initForm();
  }

  // replace with bill type Lov
  billTypeLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DEVIATION_UPDATE_BILL_BRN').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.billTypeList = [...this.billTypeList, { billTypeId: lkps.id, billTypeValue: lkps.lookupVal
              , billTypeViewVal: lkps.descr }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // for page validations
  initForm() {
    this.searchFormGroup = new FormGroup({
      billTypeFc: new FormControl('CREDIT', [Validators.required]),
      billNumbersFc: new FormControl('', [Validators.required]),
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

  // on sumbit call Get webservice and pass the data to table child component
  submit(): void {
    const newSearchData = {} as SearchBillData;
    // assign values
    newSearchData.billType = this.searchFormGroup.get('billTypeFc').value;
    newSearchData.billNumbers = this.searchFormGroup.get('billNumbersFc').value;
    // on changes
    this.searchData = newSearchData;

    this.displayBillBranchComponent = true;
  }

  // clear search values from parent table.
  getClearValue(selected: boolean) {
    if (selected) {
      this.displayBillBranchComponent = false;
      this.searchFormGroup.reset();
    } else {
      this.displayBillBranchComponent = false;
    }
  }
}
