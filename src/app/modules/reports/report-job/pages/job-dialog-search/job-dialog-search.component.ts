import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { JobReportType } from '../../models/job-report-type.model';
import { ReportJobRequest } from '../../models/job-request.model';
import { ReportJobLookUpResponse } from '../../models/look-up-response.model';
import { ReportJobService } from '../../services/report-job.service';


@Component({
  selector: 'app-job-dialog-search',
  templateUrl: './job-dialog-search.component.html',
  styleUrls: ['./job-dialog-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class JobDialogSearchComponent implements OnInit {

  showResult = false;
  searchFormGroup: FormGroup;
  searchValues: ReportJobRequest = {} as ReportJobRequest;
  jobStatusList: ReportJobLookUpResponse[] = [];
  reportJobValues: JobReportType = {} as JobReportType;

  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _reportJobService: ReportJobService,
    @Inject(MAT_DIALOG_DATA) public data: JobReportType,
    public dialogRef: MatDialogRef<JobDialogSearchComponent>) {
    this.initInterval();
  }

  // on page load
  ngOnInit() {
    this.reportJobValues = this.data;
    this.initForm();
    this.loadStatusLookValues();

    // get latest prefilled values for job id from local Storage.
    if ("PRINT_BILL" === this.reportJobValues.reportType) {
      this.searchFormGroup.controls.jobIdFc.setValue(localStorage.getItem('printBulkReportJobId'));
    } else if ("INVOICE_ANNEXURE" === this.reportJobValues.reportType) {
      this.searchFormGroup.controls.jobIdFc.setValue(localStorage.getItem('annexureLongOpsReportJobId'));
    } else if ("CUSTOMER_LEDGER" === this.reportJobValues.reportType) {
      this.searchFormGroup.controls.jobIdFc.setValue(localStorage.getItem('customerLeggerReportJobId'));
    }
  }


  // close after 15 minutes
  initInterval() {
    setTimeout(() => {
      this.dialogRef.close();
    }, 15 * 60 * 1000);
  }

  initForm() {
    this.searchFormGroup = new FormGroup({
      jobIdFc: new FormControl(''),
      jobStatusFc: new FormControl(''),
      jobfromDateFc: new FormControl(''),
      jobfromToFc: new FormControl('')
    });
  }


  // convert date to yyyy-mm-dd hh:mm:ss format
  convertDate(str: string, dateType: string) {
    const selectedDate = new Date(str);
    const presentTime = moment();
    let dateWithTime = moment(selectedDate).add({ hours: presentTime.hour(), minutes: presentTime.minute(), seconds: presentTime.second() });;

    if (selectedDate <= new Date() && 'fromDate' === dateType) {
      dateWithTime = moment(selectedDate).add({ hours: 0, minutes: 0, seconds: 0 });
    }

    const month = ("0" + (dateWithTime.month() + 1)).slice(-2);
    const day = ("0" + dateWithTime.date()).slice(-2);
    const hours = ("0" + dateWithTime.hours()).slice(-2);
    const minutes = ("0" + dateWithTime.minutes()).slice(-2);
    const seconds = ("0" + dateWithTime.seconds()).slice(-2);

    const myDate = [dateWithTime.year(), month, day].join("-");
    const myTime = [hours, minutes, seconds].join(":");
    return [myDate, myTime].join(" ");
  }

  // to load status lookup from propel-i
  loadStatusLookValues() {
    this._spinner.show();
    this._reportJobService.getReportJobStatusValues().subscribe(
      response => {
        this._spinner.hide();
        this.jobStatusList = response['data'];
      }, error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  search() {
    this.showResult = true;
    const newSearchParams = {} as ReportJobRequest;
    newSearchParams.jobId = this.searchFormGroup.get('jobIdFc').value ? this.searchFormGroup.get('jobIdFc').value : null;
    newSearchParams.parentJobId = null;
    newSearchParams.jobType = this.data.jobType;
    newSearchParams.status = this.searchFormGroup.get('jobStatusFc').value ? this.searchFormGroup.get('jobStatusFc').value : null;
    newSearchParams.fromDateTime = this.searchFormGroup.get('jobfromDateFc').value ? this.convertDate(this.searchFormGroup.get('jobfromDateFc').value, 'fromDate') : null;
    newSearchParams.toDateTime = this.searchFormGroup.get('jobfromToFc').value ? this.convertDate(this.searchFormGroup.get('jobfromToFc').value, 'toDate') : null;
    this.searchValues = newSearchParams;
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
}
