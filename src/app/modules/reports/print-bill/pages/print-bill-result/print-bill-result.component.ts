import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, DateAdapter, MAT_DATE_FORMATS, MatSort } from '@angular/material';
import { PrintSearchResult } from '../../models/print-search-result.model';
import { SelectionModel } from '@angular/cdk/collections';
import { PrintSearchRequest } from '../../models/print-search-request.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PrintBillService } from '../../service/print-bill.service';
import { PrintBillRequest } from '../../models/print-bill-request.model';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { formatDate } from '@angular/common';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';

@Component({
  selector: 'app-print-bill-result',
  templateUrl: './print-bill-result.component.html',
  styleUrls: ['./print-bill-result.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class PrintBillResultComponent implements OnInit, OnChanges, AfterViewInit {
  searchResult: PrintSearchResult;
  displayedColumns: string[] = ['select', 'documentNumber', 'documentDate', 'documentType', 'billingBranch', 'submissionBranch', 'collectionBranch', 'refdocumentType', 'amount', 'customerName', 'billingLevel', 'billingLevelCode', 'msa', 'sfx', 'rateCard'];
  dataSource: MatTableDataSource<PrintSearchResult> = new MatTableDataSource();
  selection = new SelectionModel<PrintSearchResult>(true, []);
  @Input() searchRequest: PrintSearchRequest;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  printBillRequest: PrintBillRequest[] = [];
  documentTypeCategory: string;
  documentType: string;
  billingLevel: string;
  customerName: string;
  branchBy: string;
  branchId: number;
  customerType: string;
  documentNumbers: string;
  fromDate: string;
  toDate: string;
  hideAmt: boolean = false;
  hidebillType: boolean = false;
  hidebillBr: boolean = false;
  hideSubBr: boolean = false;
  hideColBr: boolean = false;
  hideRefDocType: boolean = false;
  hideBilLvl: boolean = false;
  hideBilLvlCode: boolean = false;
  hideMsa: boolean = false;
  hideSfx: boolean = false;
  hideRc: boolean = false;
  errorMessage: ErrorMsg;


  @Input() selectedFormat: boolean;
  
  excelHeadersRetail: string[] = ['Bill Number'
    , 'Bill Date'
    , 'Bill Type'
    , 'Amount'
    , 'Customer Name'];
  excelHeadersCredit: string[] = ['Bill Number'
    , 'Bill Date'
    , 'Bill Type'
    , 'Billing Branch'
    , 'Submission Branch'
    , 'Collection Branch', 'Customer Name', 'MSA', 'SFX', 'Rate Card'];
  excelHeadersCmdm: string[] = ['Bill Number'
    , 'Bill Date'
    , 'Bill Type'
    , 'Amount'
    , 'Customer Name', 'MSA/SFX/RATE CARD', 'MSA/SFX/RATE CARD CODE'];

  @Output() searchError = new EventEmitter<string>();
  @Output('emitterClearSearchParams') clearSearchParams = new EventEmitter<boolean>(false);
  constructor(private _spinner: NgxSpinnerService,
    public _toastr: ToastrService,
    private _printBillService: PrintBillService,
    private _exportToService: ExportToExcelService) { }

  ngOnInit() {

    // if document type is CREDIT
    if (this.searchRequest.documentTypeCategory === 'CREDIT') {
      this.hideAmt = true;
      this.hideRefDocType = true;
      this.hideBilLvl = true;
      this.hideBilLvlCode = true;
    }
    if (this.searchRequest.documentTypeCategory === 'RETAIL') {
      this.hideColBr = true;
      this.hideSubBr = true;
      this.hidebillBr = true;
      this.hideMsa = true;
      this.hideSfx = true;
      this.hideRc = true;
      this.hideRefDocType = true;
      this.hideBilLvl = true;
      this.hideBilLvlCode = true;
    }

    if (this.searchRequest.documentTypeCategory === 'MEMO') {
      this.hideColBr = true;
      this.hideSubBr = true;
      this.hidebillBr = true;
      this.hideMsa = true;
      this.hideSfx = true;
      this.hideRc = true;
      this.hidebillType = true;

    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    console.log(this.searchRequest);
    this._spinner.show();
    this._printBillService.getBillsData(this.searchRequest).subscribe
      (
        success => {
          console.log("In success");
          console.log(success);
          this.dataSource = new MatTableDataSource();
          if (success.body != null && success.body.length > 0) {
            success.body.forEach(element => {
              this.dataSource.data.push(element);
            });

          }

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.selection.clear();
          this._spinner.hide();

        }, error => {
          this._spinner.hide();
          console.log("In Error");
          console.log(error);
          this.searchError.emit("error");
          this.dataSource = new MatTableDataSource();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // if (error.error.errorCode != '') {
          //   this._toastr.error("Error Code: " + error.error.errorCode + " Error Details: " + error.error.errorMessage);
          // } else {
          //   this._toastr.warning(error.message);
          // }
          console.log('ERROR Value: ', error);
          this.handleError(error);
        }
      );
  }


  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PrintSearchResult): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.documentNumber}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // submit() {
  //   if (this.selection.selected.length > 0) {
  //     this.printBillRequest = [];
  //   this.selection.selected.forEach(element => {
  //     this.printBillRequest.push({
  //       documentNumber : element.documentNumber,
  //       documentType : element.documentType,
  //       outputFormat : "PDF"
  //     });
  //   });
  //   console.log(this.printBillRequest);
  //   console.log(this.selection.selected);
  //   this._spinner.show();
  //     this._printBillService.printSelectedBill(this.printBillRequest).subscribe(
  //       response => {
  //         var file = new Blob([response.body], {
  //           type: 'application/pdf'
  //           });
  //         console.log(response);
  //         this._spinner.hide();
  //         const url = URL.createObjectURL(file);
  //         window.open(url);

  //       },
  //       error => {
  //         // show error details.
  //         console.log("In error");
  //         this._spinner.hide();
  //         //console.log(error);
  //         //console.log(this.bufferToString(error.error));
  //         const jsonResponse = JSON.parse(this.bufferToString(error.error));
  //         if (jsonResponse.errorCode != '') {
  //           this._toastr.error("Error Code: "+jsonResponse.errorCode + " Error Details: " + jsonResponse.errorMessage);
  //         } else {
  //           this._toastr.warning(error.message);
  //         }
  //       }
  //     );
  //   }
  // }

  // submit() {
  //   if (this.selection.selected.length > 0) {
  //     this.printBillRequest = [];
  //     this.selection.selected.forEach(element => {
  //       if (this.searchRequest.documentType === 'RETAIL_GST_INVOICE') {
  //         this.printBillRequest.push({
  //           documentNumber: element.documentNumber,
  //           documentType: 'RETAIL_BILL',
  //           outputFormat: "PDF"
  //         });
  //       } else {
  //         this.printBillRequest.push({
  //           documentNumber: element.documentNumber,
  //           documentType: element.documentType,
  //           outputFormat: "PDF"
  //         });
  //       }

  //     });
  //     this._spinner.show();
  //     this._printBillService.printSelectedBill(this.printBillRequest).subscribe(
  //       response => {
  //         this._spinner.hide();
  //         this._toastr.success('Job Request  ' + response.status);
  //         localStorage.setItem("printBulkReportJobId", response.jobId.toString());
  //         // this.clearSearchParams.emit(true);
  //       },
  //       error => {
  //         // show error details.
  //         console.log("In error");
  //         this._spinner.hide();
  //         this.handleError(error);
  //       }
  //     );
  //   }
  // }

  submit() {

    let isLongOps = false;

    if (this.selection.selected.length > 0) {
      this.printBillRequest = [];
      this.selection.selected.forEach(element => {
        if (this.searchRequest.documentType === 'RETAIL_GST_INVOICE') {
          this.printBillRequest.push({
            documentNumber: element.documentNumber,
            documentType: 'RETAIL_BILL',
            outputFormat: "PDF"
          });
        } else {
          this.printBillRequest.push({
            documentNumber: element.documentNumber,
            documentType: element.documentType,
            outputFormat: "PDF"
          });
        }

      });
      if (this.selection.selected.length > 2) {
        console.log('Selected Length: ', this.selection.selected.length);
        isLongOps = true;
      }
      
      this._spinner.show();
      // this._printBillService.printSelectedBill(this.printBillRequest).subscribe(
      this._printBillService.printSelectedBillWithFormat(this.printBillRequest, isLongOps, this.selectedFormat).subscribe(
        response => {
          this._spinner.hide();
          if (isLongOps) {
            let parsedResponse = this.arrayBuffer2JSON(response.body);
            console.log('LongOps Response: ', parsedResponse)
            this._toastr.success('Job Request  ' + parsedResponse.status);
            localStorage.setItem("printBulkReportJobId", parsedResponse.jobId.toString());
            // this.clearSearchParams.emit(true);
          }
          else {
            // var file = new Blob([response.body], {
            console.log('PDF Response: ',response);
            var file = new Blob([response.body], {
              type: 'application/pdf'
            });
            this._spinner.hide();
            const url = URL.createObjectURL(file);
            window.open(url);
            // this.openDownloadPDFWindow(response);
          }
        },
        error => {
          // show error details.
          console.log("In error");
          this._spinner.hide();
          //this.handleError(error);
          this.handleStringError(error);
        }
      );
    }
  }

  arrayBuffer2JSON(buf) {
    return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(buf)));
  }


  bufferToString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  }
  // ngDoCheck() {
  //   if (this.documentTypeCategory !== this.searchRequest.documentTypeCategory
  //     || this.documentType !== this.searchRequest.documentType
  //     || this.billingLevel !== this.searchRequest.billingLevel
  //     || this.customerName !== this.searchRequest.customerName
  //     || this.branchBy !== this.searchRequest.customerName
  //     || this.branchId != this.searchRequest.branchId
  //     || this.customerType !== this.searchRequest.customerType
  //     || this.documentNumbers !== this.searchRequest.documentNumbers
  //     || this.fromDate !== this.searchRequest.fromDate
  //     || this.toDate !== this.searchRequest.toDate) {
  //     this.loadData();
  //     this.documentTypeCategory = this.searchRequest.documentTypeCategory;
  //     this.documentType = this.searchRequest.documentType;
  //     this.billingLevel = this.searchRequest.billingLevel;
  //     this.customerName = this.searchRequest.customerName;
  //     this.branchBy = this.searchRequest.customerName;
  //     this.branchId = this.searchRequest.branchId;
  //     this.customerType = this.searchRequest.customerType;
  //     this.documentNumbers = this.searchRequest.documentNumbers;
  //     this.fromDate = this.searchRequest.fromDate;
  //     this.toDate = this.searchRequest.toDate;
  //   }

  // }

  // export the hold information to excel.
  export2Excel() {
    this._spinner.show();
    if (this.dataSource.data.length === 0) {
      this._toastr.warning('No Data to Export');
      this._spinner.hide();
    } else {
      if (this.searchRequest.documentTypeCategory === 'CREDIT') {
        this.exportExcelCredit();
      }
      if (this.searchRequest.documentTypeCategory === 'RETAIL') {
        this.exportExcelRetail();
      }
      if (this.searchRequest.documentTypeCategory === 'MEMO') {
        this.exportExcelCmdm();
      }
      this._spinner.hide();
    }
  }

  exportExcelCmdm() {
    const excelData = this.dataSource.data.map((obj) => ([obj.documentNumber,
    formatDate(obj.documentDate, 'dd-MM-yyyy', 'en_US'),
    obj.documentType,
    obj.amount,
    obj.customerName,
    obj.billingLevel, obj.billingLevelCode]));

    this._exportToService.export2Excel(this.excelHeadersCmdm, "Bill Details", excelData, "Bill Details");
  }

  exportExcelCredit() {
    const excelData = this.dataSource.data.map((obj) => ([obj.documentNumber,
    formatDate(obj.documentDate, 'dd-MM-yyyy', 'en_US'),
    obj.documentType,
    obj.billingBranch,
    obj.submissionBranch,
    obj.collectionBranch, obj.customerName, obj.msa, obj.sfx, obj.rateCard]));

    this._exportToService.export2Excel(this.excelHeadersCredit, "Bill Details", excelData, "Bill Details");
  }
  exportExcelRetail() {
    const excelData = this.dataSource.data.map((obj) => ([obj.documentNumber,
    formatDate(obj.documentDate, 'dd-MM-yyyy', 'en_US'),
    obj.documentType,
    obj.amount,
    obj.customerName]));

    this._exportToService.export2Excel(this.excelHeadersRetail, "Bill Details", excelData, "Bill Details");
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

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
    this.documentTypeCategory = this.searchRequest.documentTypeCategory;
    this.documentType = this.searchRequest.documentType;
    this.billingLevel = this.searchRequest.billingLevel;
    this.customerName = this.searchRequest.customerName;
    this.branchBy = this.searchRequest.customerName;
    this.branchId = this.searchRequest.branchId;
    this.customerType = this.searchRequest.customerType;
    this.documentNumbers = this.searchRequest.documentNumbers;
    this.fromDate = this.searchRequest.fromDate;
    this.toDate = this.searchRequest.toDate;
  }

}
