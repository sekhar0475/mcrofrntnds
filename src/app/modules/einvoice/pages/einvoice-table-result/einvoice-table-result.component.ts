import { createUrlResolverWithoutPackagePrefix } from '@angular/compiler';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { validateBasis } from '@angular/flex-layout';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from 'src/app/shared/components/error-dialog/error-dialog.component';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { buyerDetails } from '../../models/buyer-details.model';
import { editRequest } from '../../models/edit-request.model';
import { ResetTable } from '../../models/reset-table.model';
import { EInvoiceSearchRequest } from '../../models/search-request.model';
import { EInvoiceSearchResponse } from '../../models/search-response.model';
import { UploadEinvResult } from '../../models/upload-einv-result.model';
import { uploadErrorData } from '../../models/upload-error-data.model';
import { EinvoiceService } from '../../services/einvoice.service';

@Component({
  selector: 'app-einvoice-table-result',
  templateUrl: './einvoice-table-result.component.html',
  styleUrls: ['./einvoice-table-result.component.scss']
})
export class EinvoiceTableResultComponent implements OnChanges, AfterViewInit {

  //table
  dataSource: MatTableDataSource<EInvoiceSearchResponse> = new MatTableDataSource();
  displayedColumns: string[] = ['documentNumber',
    'documentDate',
    'parentBillNumber',
    'customerName',
    'customerMsaCode',
    'address1',
    'address2',
    'address3',
    'location',
    'pincode',
    'stateCode',
    'irnStatus',
    'igst',
    'cgst',
    'sgst',
    'errorMessage',
    'action'];

  @Input() searchValues: EInvoiceSearchRequest;
  @Input() documentType: string;
  @Output('emitterClearSearchParams') clearSearchParams = new EventEmitter<ResetTable>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() uploadData: UploadEinvResult[] = [];
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  convertedFromDate: string = "";
  convertedToDate: string = "";
  docNum: string = "";
  status: string = "";
  buyerGstin: string = "";
  allData: EInvoiceSearchResponse[];
  checkIfCredit: boolean = true;
  editRequest: editRequest = {} as editRequest;
  excelHeaders: string[] = [
    "Action",
    "IRN Status",
    "Bill No.",
    "ErrorDetails",
    "Addr1",
    "Addr2",
    "Addr3",
    "Addr4",
    "City",
    "State",
    "Pincode",
    "GSTIN",
    "GST Type",
    "Bill Date",
    "Bill Freight Amt",
    "IGST",
    "CGST",
    "SGST"
  ];

  workSheetName = "IRN Bill Details";
  fileName = "IRN Bill Details";

  correctBulkData: boolean = true;
  checkIfBulk: boolean = false;
  @Input() uploadErrors: uploadErrorData[];

  constructor(
    private _service: EinvoiceService,
    private _router: Router,
    private _dialog: MatDialog,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private _exportToService: ExportToExcelService,
    private _toastr: ToastrService,
  ) { }


  ngOnChanges(changes: SimpleChanges) {
    this.correctBulkData = true;
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  // to convert system generated date for search in database
  convert(str: string) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join('-');
    }
  }

  //for calling services for API call
  loadData() {


    this.convertedFromDate = this.convert(this.searchValues.fromDate.toString());
    this.convertedToDate = this.convert(this.searchValues.toDate.toString());
    this.buyerGstin = this.searchValues.buyerGstin ? this.searchValues.buyerGstin : '';
    this.docNum = this.searchValues.documentNum ? this.searchValues.documentNum : '';

    if (this.searchValues.status === 'ALL') {
      this.status = 'ALL';
    }
    else if (this.searchValues.status === 'SUCCESS') {
      this.status = 'Y';
    }
    else {
      this.status = 'E';
    }



    if (this.searchValues.documentType == 'wms') {
      this._spinner.show();
      this._service.getWmsEinvoices(this.docNum, this.buyerGstin, this.status, this.convertedFromDate, this.convertedToDate).subscribe(
        Response => {
          this._spinner.hide()
          this.dataSource = new MatTableDataSource(Response);
          this.ngAfterViewInit();
          this.allData = Response;
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
          this.pickSearchData(false, true);
        }

      )
    }
    if (this.searchValues.documentType == 'credit') {
      let batchNumber = this.searchValues.batchNum ? this.searchValues.batchNum : '';
      this._spinner.show();
      this._service.getCreditEinvoices(this.docNum, this.buyerGstin, this.status, batchNumber, this.convertedFromDate, this.convertedToDate).subscribe(
        Response => {
          this._spinner.hide()
          this.dataSource = new MatTableDataSource(Response);
          this.ngAfterViewInit();
          this.allData = Response;
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
          this.pickSearchData(false, true);
        }

      )
    }

    if (this.searchValues.documentType == 'cmdm') {
      this._spinner.show();
      this._service.getCmdmEinvoices(this.docNum, this.buyerGstin, this.status, this.convertedFromDate, this.convertedToDate).subscribe(
        Response => {
          this._spinner.hide()
          this.dataSource = new MatTableDataSource(Response);
          this.ngAfterViewInit();
          this.allData = Response;
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
          this.pickSearchData(false, true);
        }

      )
    }

    if (this.searchValues.documentType == 'retail') {
      this.checkIfCredit = false;
      this._spinner.show();
      // if bulk excel found 
      if (this.uploadData != null && this.uploadData.length > 0) {
        this._service.getRetailBulkUrl(this.uploadData).subscribe(
          Response => {
            console.log(Response);
            this._spinner.hide();
            this.dataSource = new MatTableDataSource(Response);
            this.ngAfterViewInit();

            let docNumList: string[] = [];

            // update the datasource with the values entered by the user.
            this.dataSource.data.forEach(row => {
              const billData = this.uploadData.filter(uploaded => uploaded.documentNumber === row.documentNumber);
              const errorMessages = this.uploadErrors.filter(uploaded => uploaded.documentNumber === row.documentNumber);
              row.documentDate = new Date(billData[0].documentDt);
              row.customerName = billData[0].buyerName;
              row.address1 = billData[0].buyerAddressLine1;
              row.address2 = billData[0].buyerAddressLine2;
              row.address3 = billData[0].buyerAddressLine3;
              row.location = billData[0].buyerLocation;
              row.pincode = Number(billData[0].buyerPin);
              row.stateCode = billData[0].buyerStateCode;

              this.correctBulkData = false;
              if(row.irnStatus !== 'Success' && row.irnStatus !== 'Pending for IRN Generation') {
                if (errorMessages[0].errorMessage != '') {
                  docNumList.push(errorMessages[0].documentNumber);
                  if ('Bill Not found in database' == row.errorMessage) {
                    row.errorMessage = 'Invalid Document Number,' + errorMessages[0].errorMessage;
                  }
                  else {
                    row.errorMessage = row.errorMessage + ',' + errorMessages[0].errorMessage;
                  }
                }
                else if ('Bill Not found in database' == row.errorMessage) {
                  docNumList.push(errorMessages[0].documentNumber);
                  row.errorMessage = 'Invalid Document Number.'
                }
                else {
                  this.correctBulkData = true;
                }
              }

            });

            if (docNumList.length != 0) {
              const dialogRef = this._dialog.open(ErrorDialogComponent, {
                data: docNumList
              });
              dialogRef.afterClosed().subscribe(result => {
                console.log(`Dialog sent: ${result}`);
                if (result) {
                  // do nothing.
                }
              });
            }

            this.checkIfBulk = true;
          },
          error => {
            console.log(error);
            this._spinner.hide();
            this.handleError(error);
          }
        );
      }
      else {
        // for individual search
        this._service.getRetailUrl(this.docNum, this.buyerGstin, this.status, this.convertedFromDate, this.convertedToDate).subscribe(
          Response => {
            this._spinner.hide();
            console.log(Response);
            this.dataSource = new MatTableDataSource(Response);
            this.ngAfterViewInit();
            this.allData = Response;
            this.checkIfCredit = false;
            this.checkIfBulk = false;
          },
          error => {
            this._spinner.hide();
            console.log(error);
            this.handleError(error);
            this.pickSearchData(false, true);
          }
        )
      }

    }

    if (this.searchValues.documentType == 'allied') {
      this._spinner.show();
      this._service.getAlliedEinvoices(this.docNum, this.buyerGstin, this.status, this.convertedFromDate, this.convertedToDate).subscribe(
        Response => {
          this._spinner.hide()
          this.dataSource = new MatTableDataSource(Response);
          this.ngAfterViewInit();
          this.allData = Response;
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
          this.pickSearchData(false, true);
        }

      )
    }
  }

  handleError(error) {
    if (error.error != null && error.error.errorMessage != null) {
      this.toastr.warning(error.error.errorMessage);
    } else {
      this.toastr.warning(error.message);
    }
  }

  //for routing to invoice details page
  updateID(documentId: number) {

    this.allData.forEach(
      (element) => {
        if (element.documentId == documentId) {
          this._service.current_data = element;
        }
      }
    );

    if (this.documentType == 'wms') {
      this._service.documentType = this.documentType;
      this._router.navigate(['einvoice/wms/update', documentId]);

    }

    if (this.documentType == 'credit') {
      this._service.documentType = this.documentType;
      this._router.navigate(['einvoice/credit/update', documentId]);
    }

    if (this.documentType == 'allied') {
      this._service.documentType = this.documentType;
      this._router.navigate(['einvoice/allied/update', documentId]);
    }

    if (this.documentType == 'cmdm') {
      this._service.documentType = this.documentType;
      this._router.navigate(['einvoice/cmdm/update', documentId]);
    }

  }

  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // page refresh.
        this.dataSource.paginator.pageIndex = 0;
        this.dataSource.paginator.pageSize = 5;

        //clear the stored data
        this.correctBulkData = true;
        this.checkIfBulk = false;
        this.uploadData = [];
        this.allData = [];
        this.editRequest = {} as editRequest;

        this.pickSearchData(true, false);
      } else {
        // do nothing.
      }
    });
  }
  // to clear the search component values
  pickSearchData(clearComponent: boolean, clearOnlyTable: boolean) {
    let clearSearch: ResetTable = {resetComponent: clearComponent, resetOnlyTable: clearOnlyTable}
    this.clearSearchParams.emit(clearSearch);
  }

  export2Excel() {
    // let State = this._service.setStateCode()
    if (this.dataSource.data.length === 0) {
      this._toastr.warning("No Data to Export");
      // } else if (this.totalPagesInData != this.currentPage) {
      //   this.ExportAllSelected(this.totalPagesInData);
    } else {
      console.log('DataSource: ', this.dataSource.data);
      const excelData = this.dataSource.data.map((obj) => [
        'Action',
        obj.irnStatus,
        obj.documentNumber,
        obj.errorMessage,
        obj.address1,
        obj.address2,
        obj.address3,
        '', // obj.addr4 does not exist in the table
        // this._service.setStateCode(obj.pincode ? obj.pincode.toString(): '').data.city.cityName
        '', // obj.city, //city is not coming
        obj.location,
        obj.pincode,
        obj.buyerDetails ? obj.buyerDetails.Gstin : '',
        obj.cgst == 0 ? '18' : '9',  //gst type
        obj.documentDate,
        obj.baseAmount,  // 'Freight Amt',// obj.FreightAmt = base Amount,
        obj.igst,
        obj.cgst,
        obj.sgst
      ]);
      this._exportToService.export2Excel(
        this.excelHeaders,
        this.workSheetName,
        excelData,
        this.fileName
      );
    }
  }

  integrate() {
    console.log('integrate to IRP Portal');
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made cannot be reverted after proceeding. Are you sure?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // create the payload and post to microservice.
        this.callUpdate();
      } else {
        // do nothing.
      }
    });
  }

  callUpdate() {
    this._spinner.show();
    let invoiceArray: editRequest[] = [];
    if(this.checkIfBulk) {
      invoiceArray = this.mapExcelDataToInvoiceArrayRequest();
    }
    else {
      invoiceArray = this.mapAllDataToInvoiceArrayRequest();
    }   
    // this._spinner.hide();
    if (invoiceArray.length === 0) {
      this._spinner.hide();
      this._toastr.warning('The given bills are either in Pending or already Integrated');
    }
    else {
      this.callPostService(invoiceArray);
    }
  }

  callPostService(invoiceArray: editRequest[]) {
    this._service.postRetailBulk(invoiceArray).subscribe(
      Response => {
        console.log(Response);
        this._spinner.hide();
        // page refresh.
        this.dataSource.paginator.pageIndex = 0;
        this.dataSource.paginator.pageSize = 5;
        this.pickSearchData(true, false);
        this._toastr.success('Bill details has been updated. Bills will be integrated to IRP portal in the next scheduled run.');
      },
      error => {
        console.log(error);
        this.handleError(error);
        this._spinner.hide();
      }
    );
  }

  mapAllDataToInvoiceArrayRequest() : editRequest[] {

    console.log('All Data: ', this.allData);

    let invoiceArray: editRequest[] = [];
    this.dataSource.data.forEach(row => {
      console.log('mapAllDataToInvoiceArrayRequest: for each row');
      const billData = this.allData.filter(uploaded => uploaded.documentNumber === row.documentNumber)
      let buyerData: buyerDetails = {} as buyerDetails;
      buyerData = {
        Gstin: billData[0].buyerDetails.Gstin,
        LglNm: billData[0].buyerDetails.LglNm,
        TrdNm: billData[0].buyerDetails.TrdNm,
        Addr1: row.address1,
        Addr2: row.address2,
        Addr3: row.address3,
        Loc: billData[0].buyerDetails.Loc,
        Pin: billData[0].buyerDetails.Pin,
        Stcd: billData[0].buyerDetails.Stcd,
        Ph: null,
        Em: null,
        Pos: billData[0].buyerDetails.Pos
      }
      this.editRequest = {
        documentId: row.documentId,
        documentNumber: row.documentNumber,
        documentDate: row.documentDate,
        buyerDetails: buyerData,
        sellerDetails: null,
        b2C: false
      }
      if (null != row.irnStatus && row.irnStatus !== 'Success' && row.irnStatus !== 'Pending for IRN Generation') {
        invoiceArray.push(this.editRequest);
      }
    });
    console.log('Invoice Array Data: ', invoiceArray);
    console.log('Invoice Array Length: ', invoiceArray.length);
    return invoiceArray;
  }

  mapExcelDataToInvoiceArrayRequest() : editRequest[] {

    console.log('Uploaded Data: ', this.uploadData);

    let invoiceArray: editRequest[] = [];
    this.dataSource.data.forEach(row => {
      console.log('mapExcelDataToInvoiceArrayRequest: for each row');
      const billData = this.uploadData.filter(uploaded => uploaded.documentNumber === row.documentNumber)
      let buyerData: buyerDetails = {} as buyerDetails;
      buyerData = {
        Gstin: billData[0].buyerGstin,
        LglNm: billData[0].buyerName,
        TrdNm: billData[0].buyerName,
        Addr1: row.address1,
        Addr2: row.address2,
        Addr3: row.address3,
        Loc: billData[0].buyerLocation,
        Pin: billData[0].buyerPin,
        Stcd: billData[0].buyerStateCode,
        Ph: null,
        Em: null,
        Pos: billData[0].buyerPlaceOfSupply
      }
      this.editRequest = {
        documentId: row.documentId,
        documentNumber: row.documentNumber,
        documentDate: row.documentDate,
        buyerDetails: buyerData,
        sellerDetails: null,
        b2C: billData[0].markAsB2C === 'Y' ? true : false
      }
      if (null != row.irnStatus && row.irnStatus !== 'Success' && row.irnStatus !== 'Pending for IRN Generation') {
        invoiceArray.push(this.editRequest);
      }
    });
    console.log('Invoice Array Data: ', invoiceArray);
    console.log('Invoice Array Length: ', invoiceArray.length);
    return invoiceArray;
  }

}

