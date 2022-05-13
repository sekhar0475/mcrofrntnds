import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { PrintSearchRequest } from '../../models/print-search-request.model';
import { DatePipe } from '@angular/common';
import { BranchDialogComponent } from '../../../email-bill/pages/branch-dialog/branch-dialog.component';
import { MatDialog, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { JobDialogSearchComponent } from '../../../report-job/pages/job-dialog-search/job-dialog-search.component';
import { ReportFormat } from '../../models/report-format.model';

interface BillTypeList {
  value: string;
  viewValue: string;
}
interface BillSubTypeList {
  value: string;
  viewValue: string;
  billType: string;
}
@Component({
  selector: 'app-print-bill-search',
  templateUrl: './print-bill-search.component.html',
  styleUrls: ['./print-bill-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class PrintBillSearchComponent implements OnInit {
  @ViewChild('myForm', { static: false }) myForm: NgForm;
  billTypeList: BillTypeList[] = [];
  billSubTypeList: BillSubTypeList[] = [];
  billSubTypeSelectedList: BillSubTypeList[] = [];
  byBranchList: BillTypeList[] = [];
  byCustomerList: BillTypeList[] = [];
  customerTypeList: BillTypeList[] = [];
  selectedBranchId: number = 0;
  createFormGroup: FormGroup;
  isSearched: boolean = false;
  fromDateValue: Date;
  billTypeSelected: string;
  searchRequest: PrintSearchRequest = {} as PrintSearchRequest;

  reportFormats: ReportFormat[] = [];
  selectedFormatValue: boolean;

  constructor(private _datePipe: DatePipe, private _dialog: MatDialog) { }

  ngOnInit() {
    this.initForm();
    this.billSubTypeList = [{ value: 'ALL', viewValue: 'ALL', billType: 'ALL' }
      , { value: 'CREDIT_MEMO_BILL', viewValue: 'CREDIT MEMO', billType: 'MEMO' }
      , { value: 'DEBIT_MEMO_BILL', viewValue: 'DEBIT MEMO', billType: 'MEMO' }
      , { value: 'CREDIT_BILL', viewValue: 'CREDIT BILL', billType: 'CREDIT' }
      , { value: 'WMS_BILL', viewValue: 'WMS BILL', billType: 'CREDIT' }
      , { value: 'ALLIED_CREDIT_BILL', viewValue: 'CREDIT ALLIED BILL', billType: 'CREDIT' }
      , { value: 'ALLIED_RETAIL_BILL', viewValue: 'RETAIL ALLIED BILL', billType: 'RETAIL' }
      , { value: 'RETAIL_GST_INVOICE', viewValue: 'RETAIL GST INVOICE', billType: 'RETAIL' }];

    this.billTypeList = [{ value: 'CREDIT', viewValue: 'CREDIT' }, { value: 'RETAIL', viewValue: 'RETAIL' }
      , { value: 'MEMO', viewValue: 'CREDIT/DEBIT MEMO' }];

    this.byBranchList = [{ value: 'ALL', viewValue: 'ALL' }, { value: 'BILLING', viewValue: 'BILLING' }, { value: 'SUBMISSION', viewValue: 'SUBMISSION' }
      , { value: 'COLLECTION', viewValue: 'COLLECTION' }];

    this.customerTypeList = [{ value: 'ALL', viewValue: 'ALL' }, { value: 'EBILL', viewValue: 'E-BILL CUSTOMER' }, { value: 'MANUAL', viewValue: 'MANUAL CUSTOMER' }];
    this.byCustomerList = [{ value: 'ALL', viewValue: 'ALL' }, { value: 'MSA', viewValue: 'MSA' }, { value: 'SFX', viewValue: 'SFX' }, { value: 'RATECARD', viewValue: 'RATE CARD' }];

    this.reportFormats = [
      {formatName: 'E-Bill', value: false},
      {formatName: 'Print-bill', value: true}
    ];
  }

    //function to convert dates
    convertDate() {
      const dte = new Date();
      this.createFormGroup.get('billPeriodtoFC').setValue(new Date());
      dte.setDate(dte.getDate() - 90);
      this.createFormGroup.get('billPeriodfromFC').setValue(dte);
          
    }


  initForm() {
    this.createFormGroup = new FormGroup({
      billtypeFC: new FormControl('', [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),
      byCustomerTypeFC: new FormControl('ALL'),
      billSubTypeFC: new FormControl('', [Validators.required]),
      byCustomerFC: new FormControl(''),
      byBranchFC: new FormControl('ALL'),
      byBillNumFC: new FormControl(''),
      searchBranchFC: new FormControl(''),
      customerTypeFC: new FormControl('ALL'),
      selectedFormatValueFC: new FormControl('', [Validators.required])
    });

    this.convertDate();
  }

  submit() {
    this.isSearched = false;

    let newSearchRequest: PrintSearchRequest = {} as PrintSearchRequest;
    newSearchRequest.documentType = (typeof this.createFormGroup.get('billSubTypeFC').value.value === 'undefined') ? null : this.createFormGroup.get('billSubTypeFC').value.value;
    newSearchRequest.fromDate = this._datePipe.transform(this.createFormGroup.get('billPeriodfromFC').value, 'dd/MM/yyyy');
    newSearchRequest.toDate = this._datePipe.transform(this.createFormGroup.get('billPeriodtoFC').value, 'dd/MM/yyyy');
    newSearchRequest.documentTypeCategory = (typeof this.createFormGroup.get('billtypeFC').value.value === 'undefined') ? null : this.createFormGroup.get('billtypeFC').value.value;
    newSearchRequest.billingLevel = (typeof this.createFormGroup.get('byCustomerTypeFC').value.value === 'undefined') ? null : this.createFormGroup.get('byCustomerTypeFC').value.value;
    newSearchRequest.branchBy = (typeof this.createFormGroup.get('byBranchFC').value.value === 'undefined') ? 'ALL' : this.createFormGroup.get('byBranchFC').value.value;
    newSearchRequest.branchId = this.selectedBranchId;
    newSearchRequest.customerName = (typeof this.createFormGroup.get('byCustomerFC').value === 'undefined') ? null : this.createFormGroup.get('byCustomerFC').value;
    newSearchRequest.customerType = (typeof this.createFormGroup.get('customerTypeFC').value.value === 'undefined') ? null : this.createFormGroup.get('customerTypeFC').value.value;
    newSearchRequest.documentNumbers = (this.createFormGroup.get('byBillNumFC').value === '') ? null : this.createFormGroup.get('byBillNumFC').value;

    if (this.searchRequest.branchId == 0 || this.searchRequest.branchBy === 'ALL') {
      this.searchRequest.branchId = null;
    }
    if (this.searchRequest.customerName === "") {
      this.searchRequest.customerName = null;
    }
    // to detect the latest changes in the child component
    this.searchRequest = newSearchRequest;
    console.log('Model Radio Button Value: ', this.selectedFormatValue);
    console.log('Form Radio Button Value: ', this.createFormGroup.get('selectedFormatValueFC').value);
    this.isSearched = true;
  }


  setDateValue(selectedDate) {
    this.fromDateValue = selectedDate.value;
  }

  selectBillType(selectedData) {
    this.isSearched = false;
    this.billTypeSelected = selectedData.value;
    this.billSubTypeSelectedList = [];
    this.billSubTypeList.forEach(element => {
      if (selectedData.value === 'CREDIT') {
        if (element.billType === selectedData.value || element.billType === 'ALL') {

          this.billSubTypeSelectedList = [...this.billSubTypeSelectedList, { value: element.value, viewValue: element.viewValue, billType: element.billType }];
        }
      } else {
        if (element.billType === selectedData.value) {

          this.billSubTypeSelectedList = [...this.billSubTypeSelectedList, { value: element.value, viewValue: element.viewValue, billType: element.billType }];
        }
      }

    });
    this.createFormGroup.controls.billSubTypeFC.setValue("");

    const byCustomerTypeFCControl = this.myForm.form.get('byCustomerTypeFC');
    const customerTypeFCControl = this.myForm.form.get('customerTypeFC');
    if (selectedData.value === 'CREDIT') {
      byCustomerTypeFCControl.setValidators([Validators.required]);
      customerTypeFCControl.setValidators([Validators.required]);
    } else {
      byCustomerTypeFCControl.setValidators(null);
      customerTypeFCControl.setValidators(null);
    }

    byCustomerTypeFCControl.updateValueAndValidity();
    customerTypeFCControl.updateValueAndValidity();

    console.log(this.billTypeSelected);
  }


  openBranchDialog() {
    const dialogRef = this._dialog.open(BranchDialogComponent, {
      height: '450px',
      width: '550px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          console.log(result);
          this.selectedBranchId = result[0].branchId;
          this.createFormGroup.controls.searchBranchFC.setValue("    " + result[0].branchName);

        }
      }
    }
    );
  }


  openJobSearch() {
    const dialogRef = this._dialog.open(JobDialogSearchComponent, {
      data: { jobType: "PRINT_BILL_BULK", reportType: "PRINT_BILL" },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          console.log(result);
        }
      }
    }
    );
  }

  clearSearchBranch() {
    this.createFormGroup.controls.searchBranchFC.setValue("");
    this.selectedBranchId = 0;
  }


  clearSearchCustomer() {
    this.createFormGroup.controls.sea.setValue("");
    this.selectedBranchId = 0;
  }

  getSearchStatus(isError: string) {
    if (isError === "error") {
      this.isSearched = false;
    }
  }

  // called from child component to clear the screeen values
  resetComponent(clear) {
    if (clear) {
      this.createFormGroup.reset();
      this.isSearched = false;
    }
  }
}



