import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { InvoiceAnnexureService } from './service/invoice-annexure.service';
import { ReportRequestCriteria } from './model/report-criteria.model';
import { ReportAnnexureRequest } from './model/report-annexure-request.model';
import { JobDialogSearchComponent } from '../../report-job/pages/job-dialog-search/job-dialog-search.component';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ReportJobLookUpResponse } from '../../report-job/models/look-up-response.model';

interface BillTypeList {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-invoice-annexure-report',
  templateUrl: './invoice-annexure-report.component.html',
  styleUrls: ['./invoice-annexure-report.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class InvoiceAnnexureReportComponent implements OnInit {

  createFormGroup: FormGroup;
  customer: CustomerDetails = {} as CustomerDetails;
  billTypeList: ReportJobLookUpResponse[] = [];
  fromDate: Date;

  checkIfRetail: boolean = false;

  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _invoiceAnnexureService: InvoiceAnnexureService) { }

  // on page load
  ngOnInit() {
    this. loadStatusLookValues();
    this.initForm();
  }


  // to load status lookup from propel-i
  loadStatusLookValues() {
    this._spinner.show();
    this._invoiceAnnexureService.getBillTypeValues().subscribe(
      response => {
        this._spinner.hide();
        this.billTypeList = response['data'];
      }, error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // form validations
  initForm() {
    this.createFormGroup = new FormGroup({
      // customerNameFC: new FormControl('', [Validators.required]),
      customerNameFC: new FormControl(''),
      billTypeFC: new FormControl('CREDIT', [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),
      invoiceNumberFC: new FormControl('', [Validators.required]),
    });
  }

  // to convert date to dd/mm/yyyy format
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

  // on click cystomer search.
  customerSearch() {
    //open the dialog page.
    const dialogRef = this._dialog.open(CustomerDialogComponent, { width: '550px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customer = result[0];
        this.createFormGroup.controls.customerNameFC.setValue(this.customer.aliasName);
      }
    }
    );

  }

  // on click excute 
  submit() {
    if(!this.checkIfRetail && JSON.stringify(this.customer) === '{}') {
      console.log('Customer: ', JSON.stringify(this.customer));
      console.log('Customer Empty check: ', JSON.stringify(this.customer) === '{}');
      this._toastr.warning("Please select a customer.");
    }
    else {
      console.log('Customer: ', JSON.stringify(this.customer));
      console.log('Executing Request.');
      this.execute();
    }
  }

  execute() {
    this._spinner.show();

    let request: ReportAnnexureRequest = {} as ReportAnnexureRequest;
    let criteria: ReportRequestCriteria = {} as ReportRequestCriteria;

    // criteria
    if(this.checkIfRetail) {
      criteria.msaId = null;
      criteria.msaCode = null;
      criteria.billConfigId = null;
    }
    else {
      criteria.msaId = this.customer.id.toString();
      criteria.msaCode = this.customer.propelMsaCode;
      criteria.billConfigId = this.customer.propelMsaCode;
    }
    criteria.customerName = this.createFormGroup.get('invoiceNumberFC').value;
    criteria.documentNumbers = this.createFormGroup.get('invoiceNumberFC').value;
    if('CREDIT' === this.createFormGroup.get('billTypeFC').value) {
      criteria.documentType = 'CREDIT_BILL'
    }
    else if ('RETAIL' === this.createFormGroup.get('billTypeFC').value) {
      criteria.documentType = 'RETAIL_BILL'
    }
    else {
      criteria.documentType = 'ALL'
    }
    criteria.fromDate = this.convert(this.createFormGroup.get('billPeriodfromFC').value);
    criteria.toDate = this.convert(this.createFormGroup.get('billPeriodtoFC').value);

    // request
    request.reportType = 'INVOICE_ANNEXURE';
    request.outputFormat = 'xlsx';
    request.isLongOps = true;
    request.criteria = criteria;


    this._invoiceAnnexureService.generateReport(request).subscribe(
      response => {
        this._spinner.hide();
        this._toastr.success("Job Request ", response.status);
        localStorage.setItem("annexureLongOpsReportJobId", response.jobId);
        // const blob = new Blob([response.body], { type: 'application/vnd.ms.excel' });
        // const file = new File([blob], 'invoiceAnnexureReport.xlsx', { type: 'application/vnd.ms.excel' });
        // saveAs(file);
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      }
    );
  }


  // open submitted jobs
  openJobSearch() {
    const dialogRef = this._dialog.open(JobDialogSearchComponent, {
      data: { jobType: "LONG_OPS_CUSTOM_REPORT", reportType: "INVOICE_ANNEXURE" },
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

  selectBillType(selectedData) {
    console.log('Selected Data: ', selectedData);
    let selectedDataValue = selectedData.lookupVal;
    if(selectedDataValue === 'RETAIL') {
      this.checkIfRetail = true;
      this.customer = {} as CustomerDetails;
    }
    else {
      this.checkIfRetail = false;
    }
  }
}
