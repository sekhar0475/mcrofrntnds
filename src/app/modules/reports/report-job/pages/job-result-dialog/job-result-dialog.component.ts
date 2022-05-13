import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { JobReportType } from '../../models/job-report-type.model';
import { ReportJobRequest } from '../../models/job-request.model';
import { ReportJobResponse } from '../../models/job-response.model';
import { ReportJobService } from '../../services/report-job.service';

@Component({
  selector: 'app-job-result-dialog',
  templateUrl: './job-result-dialog.component.html',
  styleUrls: ['./job-result-dialog.component.scss']
})
export class JobResultDialogComponent implements OnChanges {

  @Input() searchValues: ReportJobRequest;
  @Input() reportJobType: JobReportType;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[] = ['jobId' , 'jobType', 'status', 'message', 'download'];
  dataSource: MatTableDataSource<ReportJobResponse> = new MatTableDataSource();

  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _reportJobService: ReportJobService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }

  loadData() {
    this._spinner.show();
    this._reportJobService.getSubmittedJobsData(this.searchValues).subscribe(response => {
      this._spinner.hide();
      this.dataSource.data = response;
      this.dataSource.paginator = this.paginator;
    }, error => {
      // show error details.
      this._spinner.hide();
      this.handleError(error);
      this.dataSource.paginator = this.paginator;
    });
  }

  // download reports
  downloadReport(index: any) {
    let lineJobResponse: ReportJobResponse = this.dataSource.data[index];
    if ('COMPLETED' === lineJobResponse.status) {
      this.getReportByJobId(lineJobResponse.jobId, this.reportJobType.reportType);
    }
  }

  // get report
  getReportByJobId(jobId: string, reportType: string) {
    this._spinner.show();
    this._reportJobService.getReportByJobId(jobId).subscribe(response => {
      this._spinner.hide();
      // for pdf format
      if ("COMPLETED" === response.status && "PRINT_BILL" === reportType) {
        console.log(response);
        // var file = new Blob([response.resourceLink], {
        //   type: 'application/pdf'
        // });
        // this._spinner.hide();
        // const url = URL.createObjectURL(file);
        window.open(response.resourceLink);
      } else if ("COMPLETED" === response.status && ("INVOICE_ANNEXURE" === reportType || "CUSTOMER_LEDGER" === reportType)) {
        // const blob = new Blob([response.resourceLink], { type: 'application/vnd.ms.excel' });
        // const file = new File([blob], 'invoiceAnnexureReport.xlsx', { type: 'application/vnd.ms.excel' });
        window.open(response.resourceLink);

      } else {
        this._toastr.warning('Report Job is not Completed, Please try after some time.');
      }
    }, err => {
      this._spinner.hide();
      this.handleError(err);
    });
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


