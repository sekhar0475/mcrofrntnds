import { Component, OnInit, ViewChild, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { HoldServiceService } from '../../services/hold-service.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatCheckboxChange } from '@angular/material';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AutoBillCustomer } from '../../models/auto-bill-customer.model';
import { Hold } from '../../models/hold.model';
import { SearchCustomer } from '../../models/seach-customers.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { Router } from '@angular/router';
import { SearchAutoHoldBillComponent } from '../search-hold-bill/search-auto-hold-bill.component';

// this will be replaced with lookup service
interface HoldReasonList {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-auto-bill-hold',
  templateUrl: './auto-bill-hold.component.html',
  styleUrls: ['./auto-bill-hold.component.scss']
})
export class AutoBillHoldComponent implements OnInit, AfterViewInit, OnChanges {
  displayedColumns: string[] = ['select'
    , 'customerName'
    , 'msa'
    , 'alias'
    , 'sfxCode'
    , 'rateCard'
    , 'billingCycle'
    , 'billingLevel'
    , 'holdReason'
    , 'holdStatus'
    , 'holdDate'];
  excelHeaders: string[] = ['Customer Name'
    , 'Alias'
    , 'MSA'
    , 'Sfx Code'
    , 'Rate Card'
    , 'Billing Cycle'
    , 'Billing Level'
    , 'Reason'
    , 'Status'
    , 'Date'];
  workSheetName = 'Auto Bill Customer Hold Data';
  fileName = 'HoldData';
  // this will be replaced with lookup service
  reasonList: HoldReasonList[] = [];
  dataSource: MatTableDataSource<AutoBillCustomer> = new MatTableDataSource();
  tempDataSource: AutoBillCustomer[] = [];
  holdDataArray: Hold[] = [];
  selection = new SelectionModel<AutoBillCustomer>(true, []);
  childCurrentValue: SearchCustomer[] = [];
  holdStatus = '';
  customerName = '';
  msaCode = '';
  sfxCode = '';
  custType = '';
  writeAccess = false;
  editAccess = false;
  clearSearchValues: SearchCustomer = {} as SearchCustomer;

  @ViewChild(SearchAutoHoldBillComponent, { static: true })
  private mySearchBatch: SearchAutoHoldBillComponent;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _holdService: HoldServiceService,
    private _lookupService: LookupService,
    private _tokenStorage: TokenStorageService,
    private _exportToService: ExportToExcelService) { }

  ngOnInit() {
    this.holdReasonLookup();
    this.setPermissions();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadData();  // load if any change in search
  }

  holdReasonLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('AUTOBIL_HOLD_RSN').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.reasonList = [...this.reasonList, { value: lkps.id, viewValue: lkps.descr }];
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

  // load the auto bill customer details
  loadData() {
    this._spinner.show();
    this._holdService.getCustomerData(this.holdStatus, this.customerName, this.msaCode, this.sfxCode, 'CREDIT','1','5').subscribe(
      response => {
        this._spinner.hide();
        this.dataSource.data = [];
        this.tempDataSource = [];
        this.dataSource = new MatTableDataSource(response);
        // save a copy of the data in a temporary data source
        this.tempDataSource = this.dataSource.data.map(row => Object.assign({}, row));
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('NO DATA FOUND');
        }
        this.dataSource.paginator = this.paginator;
      },
      error => {
        // show error details.
        this._spinner.hide();
        this.dataSource.data = [];
        if (error.error.errorCode != null) {
          if (error.error.errorCode === 'handled_exception') {
            this._toastr.warning(error.error.errorMessage);
          } else {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.errorDetails);
          }
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }

  setPermissions() {
    // set the user access
    const path = this._router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y') {
      this.writeAccess = true;
      this.editAccess = true;
      return;
    } else if (this._tokenStorage.getCurrentModuleUpdateFlag() != null && this._tokenStorage.getCurrentModuleUpdateFlag() === 'Y') {
      this.editAccess = true;
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
      this.editAccess = false;
    }
  }

  // this method will be called from search child component on search click
  getSearchVal(selected: any) {
    if (selected) {
      this.childCurrentValue = selected;
      // since single array will be there dirctly adding values
      this.holdStatus = this.childCurrentValue['holdStatus'.toString()] == null ? '' : this.childCurrentValue['holdStatus'.toString()];
      this.customerName = this.childCurrentValue['customerName'.toString()] == null ? '' :
        this.childCurrentValue['customerName'.toString()];
      this.msaCode = this.childCurrentValue['msaCode'.toString()] == null ? '' : this.childCurrentValue['msaCode'.toString()];
      this.sfxCode = this.childCurrentValue['sfxCode'.toString()] == null ? '' : this.childCurrentValue['sfxCode'.toString()];
      this.custType = this.childCurrentValue['custTypeId'.toString()] == null ? '' : this.childCurrentValue['custTypeId'.toString()];
      //  call get method once varibales are assigned on click search from child
      this.loadData();
    }
  }
  // to check if the customer is on HOLD.
  checkIfHold(dataRow: AutoBillCustomer) {
    if (dataRow.status != null && dataRow.status === 'HOLD') {
      return 'checked';
    } else {
      return false;
    }
  }
  // if there's change in HOLD status.
  changeRow(row: AutoBillCustomer, value: MatCheckboxChange) {
    if (value.checked) {
      row.status = 'HOLD';
      row.holdDate = new Date();
    } else {
      row.status = null;
      row.holdDate = null;
      row.reason = null;
    }
    // check if there is any change in the hold status
    let i = 0;
    for (i = 0; i < this.tempDataSource.length; i++) {
      if (this.tempDataSource[i].billConfigId === row.billConfigId && this.tempDataSource[i].status === row.status) {
        this.remove(row);
        row.holdDate = this.tempDataSource[i].holdDate;
        row.reason = this.tempDataSource[i].reason;
      }
      if (this.tempDataSource[i].billConfigId === row.billConfigId && this.tempDataSource[i].status !== row.status) {
        this.remove(row);
        this.addArray(row);
      }
    }
  }
  // add the details into hold array
  addArray(row: AutoBillCustomer) {
    let i = 0;
    let flag = 0;
    // check if this data is already available in the holdDataArray
    for (i = 0; i < this.holdDataArray.length; i++) {
      if (this.holdDataArray[i].billConfigId === row.billConfigId) {
        flag = 1;
        break;
      }
    }
    if (flag === 0) {
      this.holdDataArray.push({
        holdId: row.holdId,
        msaCode: row.msaCode,
        msaId: row.msaId,
        billConfigId: row.billConfigId,
        holdStatus: row.status,
        holdReason: row.reason,
        billingLevelId: row.billingLevelId,
        billingLevelCode: row.billingLevelCode,
        billingLevel: row.billingLevel
      });
      console.log('this.holdDataArray');
      console.log(this.holdDataArray);
    }
  }
  // to remove the hold details from the hold array, as there is no change in data to be pushed.
  remove(row: AutoBillCustomer) {
    let i = 0;
    for (i = 0; i < this.holdDataArray.length; i++) {
      if (this.holdDataArray[i].billConfigId === row.billConfigId) {
        this.holdDataArray.splice(i, 1);
      }
    }
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.dataSource.data ? this.dataSource.data.filter(data => data.status === 'HOLD').length : 0;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  // to toggle the header checkbox.
  customToggle(eventValue: MatCheckboxChange) {
    if (eventValue.checked) {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.dataSource.data.forEach(row => row.status = 'HOLD');
      this.dataSource.data.forEach(row => row.holdDate = row.holdDate ? row.holdDate : new Date());
      this.holdDataArray = [];
      this.dataSource.data.forEach(row => this.addAllArrayWithHold(row));

    } else {
      this.selection.clear();
      this.dataSource.data.forEach(row => row.status = null);
      this.dataSource.data.forEach(row => row.holdDate = null);
      this.dataSource.data.forEach(row => row.reason = null);
      this.holdDataArray = [];
      this.dataSource.data.forEach(row => this.addAllArrayWithHold(row));
    }
  }
  // add all not-hold customers into holdDataArray
  addAllArrayWithHold(dataRow: AutoBillCustomer) {
    let i = 0;
    for (i = 0; i < this.tempDataSource.length; i++) {
      // if there's a change.
      if (this.tempDataSource[i].billConfigId === dataRow.billConfigId && this.tempDataSource[i].status !== dataRow.status) {
        this.holdDataArray.push({
          holdId: this.tempDataSource[i].holdId
          , msaId: this.tempDataSource[i].msaId
          , msaCode: this.tempDataSource[i].msaCode
          , billConfigId: this.tempDataSource[i].billConfigId
          , holdReason: dataRow.reason
          , holdStatus: dataRow.status
          , billingLevelId: dataRow.billingLevelId
          , billingLevelCode: dataRow.billingLevelCode
          , billingLevel: dataRow.billingLevel
        });
      }

      // if there's no change.
      if (this.tempDataSource[i].billConfigId === dataRow.billConfigId && this.tempDataSource[i].status === dataRow.status) {
        dataRow.holdDate = this.tempDataSource[i].holdDate;
        dataRow.reason = this.tempDataSource[i].reason;
      }
    }
  }
  // to make reason non-ediable if there is no hold applied for the customer.
  reasonEditable(rowBillConfigId: number, status: string) {
    if (this.tempDataSource.length > 0) {
      let existingVal = null;
      let i = 0;
      let exstingholdId = 0;
      // enable hold only when new holds are applied.
      for (i = 0; i < this.tempDataSource.length; i++) {
        if (this.tempDataSource[i].billConfigId === rowBillConfigId) {
          existingVal = this.tempDataSource[i].status;
          exstingholdId = this.tempDataSource[i].holdId;
          if (existingVal === status) {
            return true;
          } else if (existingVal === 'HOLD') {
            return true;
          } else {
            return false;
          }
        }
      }
    }
    return true;
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
        this.mySearchBatch.refresh();
        this.dataSource.data= [];
        this.clearSearch();
      } else {
        // do nothing.
      }
    });
  }

  // to clear values of search
  clearSearch() {
    this.holdStatus = '';
    this.customerName = '';
    this.msaCode = '';
    this.sfxCode = '';
  }
  // on submission
  submit(): void {
    if (this.holdDataArray.length === 0) {
      this._toastr.warning('No transaction/changes available to commit to database.');
    } else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'This action would exclude/include Credit Contracts from future AutoBilling Processing, Do you want to Continue?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.tempDataSource = this.dataSource.data;
          // POST data into database
          this.postholdData();
        } else {
          // do nothing.
        }
      });
    }
  }
  // call POST for submission
  postholdData() {
    // check if there's any data to post.
    if (this.holdDataArray.length > 0) {
      // get the hold reason
      this._spinner.show();
      let i = 0;
      for (i = 0; i < this.holdDataArray.length; i++) {
        // get the hold reason for the row with hold status as HOLD.
        if (this.holdDataArray[i].holdStatus != null &&
          this.holdDataArray[i].holdStatus === 'HOLD') {
          // get the datasource row
          const holdRow = this.dataSource.data.filter(
            data => data.billConfigId === this.holdDataArray[i].billConfigId
          );
          this.holdDataArray[i].holdReason = holdRow[0].reason;
        }
      }
      this._holdService.postHoldData(this.holdDataArray).subscribe
        (
          response => {
            this._spinner.hide();
            this.selection = new SelectionModel<AutoBillCustomer>(true, []);
            this.holdDataArray = [];
            this.dataSource.data = [];
            this.tempDataSource = [];
            this._toastr.success(response);
            // this.mySearchBatch.refresh();
          },
          error => {
            this._spinner.hide();
            if (error.error.errorCode != null) {
              if (error.error.errorCode === 'handled_exception') {
              } else {
                this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
              }
            } else {
              this._toastr.warning(error.message);
            }
          }
        );
    }
  }
  // export the hold information to excel.
  export2Excel() {
    this._spinner.show();
    if (this.tempDataSource.length === 0) {
      this._toastr.warning('No Data to Export');
      this._spinner.hide();
    } else {
      // data mapping for excel
      const excelData = this.dataSource.data.map((obj) => ([obj.customerName,
      obj.aliasName,
      obj.msaCode,
      obj.sfxCode,
      obj.rateCardCode,
      obj.billingCycle,
      obj.billingLevel,
      obj.reason,
      obj.status,
      obj.holdDate]));
      this._exportToService.export2Excel(this.excelHeaders, this.workSheetName, excelData, this.fileName);
      this._spinner.hide();
    }
  }
}

