import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomerSearchDialogComponent } from './customer-search-dialog/customer-search-dialog.component';
import { CustomerLedgerService } from './service/customer-ledger.service';
import { SubmitJobRequest } from './model/report-job-submit-criteria.model';
import { JobDialogSearchComponent } from '../../report-job/pages/job-dialog-search/job-dialog-search.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';

interface BillTypeList {
  value: string;
  viewValue: string;
  billConfigId: string;
}

@Component({
  selector: 'app-customer-ledger',
  templateUrl: './customer-ledger.component.html',
  styleUrls: ['./customer-ledger.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class CustomerLedgerComponent implements OnInit {
  msaNameList: BillTypeList[] = [];
  sfxCodeList: BillTypeList[] = [{ value: 'ALL', viewValue: 'ALL', billConfigId: null }];
  createFormGroup: FormGroup;
  toDateValue: Date;
  customer: CustomerDetails = {} as CustomerDetails;
  toPeriod: Date;
  fromPeriod: Date;
  billConfigId: string = null;
  sfxAvailable = false;

  constructor(
    private _dialog: MatDialog,
    public _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _ledgerService: CustomerLedgerService) { }
  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      customerNameFC: new FormControl('', [Validators.required]),
      sfxCodeFC: new FormControl('', [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),

    });
  }

  // to convert date to yyyy-mm-dd format
  convert(str) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join('/');
    } else {
      return '';
    }
  }

  submit() {
    this._spinner.show();
    let request: SubmitJobRequest = {} as SubmitJobRequest;
    let criteria: ReportCriteria = {} as ReportCriteria;
    console.log('Customer Data ', this.billConfigId);

    // criteria
    criteria.billConfigId = this.billConfigId;
    criteria.customerName = this.customer.msaName;
    criteria.documentNumbers = null;
    criteria.documentType = null;
    criteria.msaCode = this.customer.propelMsaCode;
    criteria.msaId = this.customer.id.toString();
    criteria.fromDate = this.convert(this.fromPeriod);
    criteria.toDate = this.convert(this.toPeriod);
    if (this.createFormGroup.get('sfxCodeFC').value != null && this.createFormGroup.get('sfxCodeFC').value != 'ALL') {
      criteria.sfxCode = this.createFormGroup.get('sfxCodeFC').value;
    }

    // request
    request.reportType = 'CUSTOMER_LEDGER';
    request.outputFormat = 'xlsx';
    request.isLongOps = true;
    request.criteria = criteria;

    this._ledgerService.postReport(request).subscribe(
      response => {
        this._spinner.hide();
        this._toastr.success("Job Request ", response.status);
        localStorage.setItem("customerLeggerReportJobId", response.jobId);
        this.resetComponent(true);
      },
      error => {
        this._spinner.hide();
        console.log(error);
        this.handleError(error);
      }
    );

  }

  customerSearch() {
    this.sfxAvailable = false;
    //open the dialog page.
    const dialogRef = this._dialog.open(CustomerSearchDialogComponent, { width: '550px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.sfxCode = null;
        this.customer = result[0];
        this.sfxCodeList = [{ value: 'ALL', viewValue: 'ALL', billConfigId: null }];
        // get the sfx list 
        this.customer.billingInfo.forEach(data => {
          if (data.sfxNo != null && data.sfxNo != "" && data.billingLevel != null && data.billingLevel != 'MSA') {
            this.sfxCodeList = [...this.sfxCodeList, { value: data.sfxNo, viewValue: data.sfxNo, billConfigId: data.billConfigId }];
          }
        }
        );
        if (this.sfxCodeList.length > 1) {
          this.removeDuplicateSfx();
          this.sfxAvailable = true;
        } else {
          console.log('sfxcode not found');
          this.createFormGroup.controls.sfxCodeFC.setValue('ALL');
        }
        console.log(this.sfxCodeList);
      }
    });
  }

  removeDuplicateSfx() {
    const values = this.sfxCodeList.map(element => element.value)
    const filtered = this.sfxCodeList.filter(({value}, index) => !values.includes(value, index + 1))
    this.sfxCodeList = filtered;
  }

  // open submitted jobs
  openJobSearch() {
    const dialogRef = this._dialog.open(JobDialogSearchComponent, {
      data: { jobType: "LONG_OPS_CUSTOM_REPORT", reportType: "CUSTOMER_LEDGER" },
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

  // to handle error in toastr
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

  // resets the search values.
  resetComponent(clear: boolean) {
    if (clear) {
      this.customer = {} as CustomerDetails;
      this.createFormGroup.reset();
    }
  }
}
