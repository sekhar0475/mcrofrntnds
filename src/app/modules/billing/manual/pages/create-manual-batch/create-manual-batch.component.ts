import { CustomerSearchRequest } from "./../../models/customer-search-request.model";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { ManualBillingService } from "../../services/manual-billing.service";
import { ToastrService } from "ngx-toastr";
import { ConfirmationDialogComponent } from "src/app/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ExportToExcelService } from "src/app/shared/services/export-to-excel-service/export-to-excel.service";
import { TokenStorageService } from "src/app/modules/login/services/token-storage.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ErrorMsg } from "src/app/shared/models/global-error.model";
import { Router } from "@angular/router";
import { CreateManualSearchComponent } from "../create-manual-search/create-manual-search.component";
import { ConfirmationSuccessDialogComponent } from "src/app/shared/components/confirmation-success-dialog/confirmation-success-dialog.component";
import { ManualCustomerResponse } from "../../models/cutomer-response.model";

// pagination default and max values
const DEFUALT_PAGE_NUMBER = '0';
const MAX_DATA_PER_PAGE = '0';

@Component({
  selector: "app-create-manual-batch",
  templateUrl: "./create-manual-batch.component.html",
  styleUrls: ["./create-manual-batch.component.scss"],
})
export class CreateManualBatchComponent implements OnInit {
  displayedColumns: string[] = [
    "select",
    "msaCustName",
    "aliasName",
    "msaCustCode",
    "cntrCode",
    "rateCardCode",
    "billingByLvlVal",
    "billingLevel",
    "bkgBrCount",
    "validBrCount",
    "excludeBrCount",
  ];

  // displayedColumns: string[] = [
  //   "select",
  //   "customerName",
  //   "alias",
  //   "msa",
  //   "sfxcode",
  //   "rateCard",
  //   "bilingBy",
  //   "billingLevel",
  //   "bookingBrCount",
  //   "billingBrCount",
  //   "excludeBlngCount",
  // ];
  // dataSource: MatTableDataSource<MCustomerSearchResponseDto> = new MatTableDataSource();
  dataSource: MatTableDataSource<ManualCustomerResponse> = new MatTableDataSource();

  // selection = new SelectionModel<CustomerSearchResponseDto>(true, []);

  selection = new SelectionModel<ManualCustomerResponse>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  childCurrentValue: CustomerSearchRequest[] = [];
  clearSearchValues: CustomerSearchRequest = {} as CustomerSearchRequest;
  // customerData: CustomerSearchResponseDto[] = [];

  customerData: ManualCustomerResponse[] = [];

  // selectedData: CustomerSearchResponseDto[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selectedData: ManualCustomerResponse[] = [];
  // totalPagesInData: number = 0;
  // totalRecInData: number = 0;
  // currentPage: number = 0;
  // resetFlag: number = 0;
  type = "";
  billingCycle = "";
  billingLevel = "";
  autoBillFlag = "";
  customerName = "";
  msaCode = "";
  sfxCode = "";
  writeAccess = false;
  editAccess = false;
  errorMessage: ErrorMsg;
  excelHeaders: string[] = [
    "Customer Name",
    "Alias",
    "MSA",
    "Sfx Code",
    "Rate Card",
    "Billing By",
    "Billing Level",
    "Booking Branch Count",
    "Billing Branch Count",
    "Excluded Branch Count",
  ];

  workSheetName = "Customer Details";
  fileName = "ManualBatchCreationData";
  // to call child class methods
  @ViewChild(CreateManualSearchComponent, { static: true })
  private mySearchBatch: CreateManualSearchComponent;

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _tokenStorage: TokenStorageService,
    private _exportToService: ExportToExcelService,
    private _manualBillingService: ManualBillingService
  ) { }

  ngOnInit() {
    this.setPermissions();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   if (this.isAllSelected()) {
  //     this.selection.clear();
  //   } else {
  //     this.markallSelected(this.totalPagesInData);
  //   }
  // }

  // checkboxLabel(row?: CustomerSearchResponseDto): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? "select" : "deselect"} all`;
  //   }
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: ManualCustomerResponse): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  getSearchVal(selected: any) {
    if (selected) {
      this.selection.clear();
      this.childCurrentValue = selected;
      this.type =
        this.childCurrentValue["type".toString()] == null
          ? ""
          : this.childCurrentValue["type".toString()]; // credit cust
      this.billingLevel =
        this.childCurrentValue["billingLevel".toString()] == null
          ? ""
          : this.childCurrentValue["billingLevel".toString()];
      this.billingCycle = this.childCurrentValue["billingCycle".toString()];
      this.autoBillFlag = "N";
      this.customerName =
        this.childCurrentValue["customerName".toString()] == null
          ? ""
          : this.childCurrentValue["customerName".toString()];
      this.msaCode =
        this.childCurrentValue["msaCode".toString()] == null
          ? ""
          : this.childCurrentValue["msaCode".toString()];
      this.sfxCode =
        this.childCurrentValue["sfxCode".toString()] == null
          ? ""
          : this.childCurrentValue["sfxCode".toString()];
      //  call get method once varibales are assigned on click search from child
      this.loadData();
    }
  }
  // // call service when search button is clicked
  // loadData() {
  //   this._spinner.show();
  //   this.resetFlag = 1;
  //   this._manualBillingService
  //     .getEligibleContracts(
  //       "CREDIT",
  //       this.billingLevel,
  //       this.billingCycle,
  //       this.customerName,
  //       this.msaCode,
  //       this.sfxCode,
  //       this.autoBillFlag,
  //       DEFUALT_PAGE_NUMBER,
  //       MAX_DATA_PER_PAGE
  //     )
  //     .subscribe(
  //       (response) => {
  //         if(response == null) {
  //           this._spinner.hide();
  //         }
  //         var set = new Set(response);
  //         this.dataSource = new MatTableDataSource(Array.from(set));
  //         console.log(set);
  //         response.forEach((res) => {
  //           this.totalPagesInData = parseInt(res.pagesCount);
  //           this.totalRecInData = parseInt(res.recordCount);
  //         });
  //         // this.dataSource.paginator = this.paginator;
  //         if (this.dataSource.data.length === 0) {
  //           this._toastr.warning("No Data Found");
  //           this.resetFlag = 0;
  //           this.totalRecInData = 0;
  //         } else {
  //           this.currentPage = 1;
  //         }
  //         this._spinner.hide();
  //       },
  //       (error) => {
  //         // show error details.
  //         this._spinner.hide();
  //         this.handleError(error);
  //       }
  //     );
  // }


  // call service when search button is clicked
  loadData() {
    this._spinner.show();
    // this.resetFlag = 1;
    this._manualBillingService
      .getManualEligibleContracts(
        "CREDIT",
        this.billingLevel,
        this.billingCycle,
        this.customerName,
        this.msaCode,
        this.sfxCode,
        this.autoBillFlag,
        DEFUALT_PAGE_NUMBER,
        MAX_DATA_PER_PAGE
      )
      .subscribe(
        (response) => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          if (this.dataSource.data.length === 0) {
            this._spinner.hide();
            this._toastr.warning("No Data Found");
          }
        },
        (error) => {
          // show error details.
          this._spinner.hide();
          this.handleError(error);
        }
      );
  }
  setPermissions() {
    // set the user access
    const path = this._router.url;
    const routerPart = path.split("/");
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? "/" + routerPart[i] + "/" : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (
      this._tokenStorage.getCurrentModuleWriteFlag() != null &&
      this._tokenStorage.getCurrentModuleWriteFlag() === "Y"
    ) {
      this.writeAccess = true;
      this.editAccess = true;
      return;
    } else if (
      this._tokenStorage.getCurrentModuleUpdateFlag() != null &&
      this._tokenStorage.getCurrentModuleUpdateFlag() === "Y"
    ) {
      this.editAccess = true;
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
      this.editAccess = false;
    }
  }

  submit(): void {
    if (this.selection.selected.length === 0) {
      this._toastr.warning(
        "No transaction/changes available to commit to database."
      );
    } else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: "Please confirm if you want to proceed further?",
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // POST data into database
          this.postSelectedData();
        } else {
          // do nothing.
        }
      });
    }
  }

  // post data to data base
  postSelectedData() {
    if (this.selection.selected.length > 0) {
      this.selectedData = [];
      this.selection.selected.forEach((data) => {
        this.selectedData.push(data);
      });
      this._spinner.show();
      this._manualBillingService
        .postBatchCreation(this.selection.selected)
        .subscribe(
          (response) => {
            this._spinner.hide();
            // this._toastr.success(response);

            const dialogRef = this._dialog.open(
              ConfirmationSuccessDialogComponent,
              {
                data: {
                  value: response,
                  message: "Batch Creation Request Initiated",
                },
                disableClose: true,
              }
            );
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                // this._router.navigate(["/dashboard"]);
              }
            });
            this.selection.clear();
            this.mySearchBatch.refresh();
            this.dataSource = new MatTableDataSource(this.customerData);
          },
          (error) => {
            // show error details.
            this._spinner.hide();
            this.handleStringError(error);
          }
        );
    }
  }

  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data:
        "Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // used for search reset
        this.selection.clear();
        this.mySearchBatch.refresh();
        this.dataSource = new MatTableDataSource(this.customerData);
      } else {
        // do nothing.
      }
    });
  }

  // ExportAllSelected(activePageNumber: number) {
  //   this.resetFlag = 0;
  //   while (activePageNumber > this.currentPage) {
  //     this._spinner.show();
  //     this.currentPage = this.currentPage + 1;
  //     this._manualBillingService
  //       .getEligibleContracts(
  //         "CREDIT",
  //         this.billingLevel,
  //         this.billingCycle,
  //         this.customerName,
  //         this.msaCode,
  //         this.sfxCode,
  //         this.autoBillFlag,
  //         this.currentPage.toString(),
  //         MAX_DATA_PER_PAGE
  //       )
  //       .subscribe(
  //         (response) => {
  //           if(response == null) {
  //             this._spinner.hide();
  //           }
  //           let curResPage = 0;
  //           response.forEach((res) => {
  //             this.dataSource.data.push(res);
  //             curResPage = parseInt(res.currentPageNum);
  //           });
  //           this.dataSource.paginator = this.paginator;
  //           if (this.dataSource.data.length === 0) {
  //             this._spinner.hide();
  //             this._toastr.warning("No Data Found");
  //           }
  //           if (curResPage >= activePageNumber) {
  //             this._spinner.hide();
  //             this.resetFlag = -1;
  //             const excelData = this.dataSource.data.map((obj) => [
  //               obj.custName,
  //               obj.alias,
  //               obj.msaCode,
  //               obj.sfxCode,
  //               obj.rateCard,
  //               obj.billingBy,
  //               obj.billingLevel,
  //               obj.bookingBrCount,
  //               obj.billingBrCount,
  //               obj.excludeBrCount,
  //             ]);
  //             this._exportToService.export2Excel(
  //               this.excelHeaders,
  //               this.workSheetName,
  //               excelData,
  //               this.fileName
  //             );

  //           }
  //         },
  //         (error) => {
  //           this._spinner.hide();
  //           this.handleError(error);
  //         }
  //       );
  //   }
  // }

  // // export the hold information to excel.
  // export2Excel() {
  //   if (this.dataSource.data.length === 0) {
  //     this._toastr.warning("No Data to Export");
  //   } else if (this.totalPagesInData != this.currentPage) {
  //     this.ExportAllSelected(this.totalPagesInData);
  //   } else {
  //     const excelData = this.dataSource.data.map((obj) => [
  //       obj.msaCustCode,
  //       obj.aliasName,
  //       obj.msaCustCode,
  //       obj.cntrCode,
  //       obj.rateCardCode,
  //       obj.billingByLvlVal,
  //       obj.billingLevel,
  //       obj.bkgBrCount,
  //       obj.validBrCount,
  //       obj.excludeBrCount,
  //     ]);
  //     this._exportToService.export2Excel(
  //       this.excelHeaders,
  //       this.workSheetName,
  //       excelData,
  //       this.fileName
  //     );
  //   }
  // }

  // export the hold information to excel.
  export2Excel() {
    if (this.dataSource.data.length === 0) {
      this._toastr.warning("No Data to Export");
    } else {
      const excelData = this.dataSource.data.map((obj) => [
        obj.msaCustCode,
        obj.aliasName,
        obj.msaCustCode,
        obj.cntrCode,
        obj.rateCardCode,
        obj.billingByLvlVal,
        obj.billingLevel,
        obj.bkgBrCount,
        obj.validBrCount,
        obj.excludeBrCount,
      ]);
      this._exportToService.export2Excel(
        this.excelHeaders,
        this.workSheetName,
        excelData,
        this.fileName
      );
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // errors function
  handleError(error: any) {
    if (error.error != null) {
      if (error.error.errorCode === "handled_exception") {
        this._toastr.warning(error.error.errorMessage);
      } else {
        this._toastr.warning(
          error.error.errorMessage + " Details: " + error.error.errorDetails
        );
      }
    } else {
      this._toastr.warning(error.message);
    }
  }

  // errors string response function
  handleStringError(error: any) {
    this.errorMessage = JSON.parse(error.error);
    console.log(this.errorMessage);
    if (this.errorMessage != null) {
      if (this.errorMessage.errorCode === "handled_exception") {
        this._toastr.warning(this.errorMessage.errorMessage);
      } else {
        this._toastr.warning(
          this.errorMessage.errorMessage +
          " Details: " +
          this.errorMessage.errorDetails
        );
      }
    } else {
      this._toastr.warning(error.message);
    }
  }

  // getMoreCustomer(activePageNumber: number) {
  //   this.resetFlag = 0;
  //   if (activePageNumber > 0) {
  //     this._spinner.show();
  //     this.currentPage = activePageNumber;
  //     this._manualBillingService
  //       .getEligibleContracts(
  //         "CREDIT",
  //         this.billingLevel,
  //         this.billingCycle,
  //         this.customerName,
  //         this.msaCode,
  //         this.sfxCode,
  //         this.autoBillFlag,
  //         activePageNumber.toString(),
  //         MAX_DATA_PER_PAGE
  //       )
  //       .subscribe(
  //         (response) => {
  //           if (response == null) {
  //             this._spinner.hide();
  //           }
  //           let curResPage = 0;
  //           response.forEach((res) => {
  //             //  this.dataSource.data.push(res);
  //             curResPage = parseInt(res.currentPageNum);
  //           });
  //           this.dataSource.paginator = this.paginator;
  //           if (this.dataSource.data.length === 0) {
  //             this._toastr.warning("No Data Found");
  //           }
  //           if (curResPage == activePageNumber) {
  //             this._spinner.hide();
  //           }
  //         },
  //         (error) => {
  //           this._spinner.hide();
  //           this.handleError(error);
  //         }
  //       );
  //   }
  // }

  // // Method to get all records
  // getShowAllCustomer(activePageNumber: number) {
  //   this.resetFlag = 0;
  //   while (activePageNumber > this.currentPage) {
  //     this._spinner.show();
  //     this.currentPage = this.currentPage + 1;
  //     this._manualBillingService
  //       .getEligibleContracts(
  //         "CREDIT",
  //         this.billingLevel,
  //         this.billingCycle,
  //         this.customerName,
  //         this.msaCode,
  //         this.sfxCode,
  //         this.autoBillFlag,
  //         this.currentPage.toString(),
  //         MAX_DATA_PER_PAGE
  //       )
  //       .subscribe(
  //         (response) => {
  //           if (response == null) {
  //             this._spinner.hide();
  //           }
  //           let curResPage = 0;
  //           response.forEach((res) => {
  //             // this.dataSource.data.push(res);
  //             curResPage = parseInt(res.currentPageNum);
  //           });
  //           this.dataSource.paginator = this.paginator;
  //           if (this.dataSource.data.length === 0) {
  //             this._spinner.hide();
  //             this._toastr.warning("No Data Found");
  //           }
  //           if (curResPage >= activePageNumber) {
  //             this._spinner.hide();
  //           }
  //         },
  //         (error) => {
  //           this._spinner.hide();
  //           this.handleError(error);
  //         }
  //       );
  //   }
  // }

  // // Method to get all records and mark them selected
  // markallSelected(activePageNumber: number) {
  //   this.resetFlag = 0;
  //  //  this.dataSource.data.forEach((row) => this.selection.select(row));
  //   while (activePageNumber > this.currentPage) {
  //     this._spinner.show();
  //     this.currentPage = this.currentPage + 1;
  //     this._manualBillingService
  //       .getEligibleContracts(
  //         "CREDIT",
  //         this.billingLevel,
  //         this.billingCycle,
  //         this.customerName,
  //         this.msaCode,
  //         this.sfxCode,
  //         this.autoBillFlag,
  //         this.currentPage.toString(),
  //         MAX_DATA_PER_PAGE
  //       )
  //       .subscribe(
  //         (response) => {
  //           if(response == null) {
  //             this._spinner.hide();
  //           }
  //           let curResPage = 0;
  //           response.forEach((res) => {
  //             // this.dataSource.data.push(res);
  //            // this.selection.select(res);
  //             curResPage = parseInt(res.currentPageNum);
  //           });
  //           this.dataSource.paginator = this.paginator;
  //           if (this.dataSource.data.length === 0) {
  //             this._spinner.hide();
  //             this._toastr.warning("No Data Found");
  //           }
  //           if (curResPage >= activePageNumber) {
  //             this.resetFlag = -1;
  //             this._spinner.hide();
  //           }
  //         },
  //         (error) => {
  //           this._spinner.hide();
  //           this.handleError(error);
  //         }
  //       );
  //   }
  // }
}
