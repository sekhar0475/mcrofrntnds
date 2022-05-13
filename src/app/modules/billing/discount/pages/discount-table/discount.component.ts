import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DiscountData } from '../../models/discount.model';
import { DiscountServiceService } from '../../services/discount-service.service';
import { DiscountArry } from '../../models/discount-array.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DiscountSearch } from '../../models/discount-search.model';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { DiscountSign } from '../../models/discount-sign.model';
import { DiscountType } from '../../models/discount-type.model';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit, AfterViewInit, OnChanges {
  discSignList: DiscountSign[] = [];
  discTypeList: DiscountType[] = [];
  displayedColumns: string[] = ['batchNum', 'billNum', 'custName', 'blngLevel', 'msaCode', 'sfxCode', 'rateCardCode', 'amount', 'discSign',
    'discType', 'value', 'discountVal', 'revisedBillAmt', 'revisedGBillAmt'];
  discount: DiscountData[] = [];
  childCurrentValue: DiscountSearch[] = [];
  discountArray: DiscountArry[] = [];
  errorArr: string[] = [];
  batchNumber = '';
  billNumbers = '';
  clearSearchValues: DiscountSearch = {} as DiscountSearch;
  maxPercentage = '100';
  writeAccess = false;
  editAccess = false;
  errorMessage: ErrorMsg;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<DiscountData> = new MatTableDataSource();

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _tokenStorage: TokenStorageService,
    private _discountService: DiscountServiceService) { }


  ngOnInit() {
    this.discSignLookup();
    this.discTypelookup();
    this.setPermissions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // get data for discount
  loadData() {
    if (this.batchNumber !== '' || this.batchNumber != null) {
      this._spinner.show();
      this._discountService.getDiscountData(this.batchNumber, this.billNumbers).subscribe(
        response => {
          console.log(response);
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.discount = [];
          this.discount = response;
          this.dataSource.paginator = this.paginator;
          if (this.dataSource.data.length === 0) {
            this._toastr.warning('No Data Found');
          }
        },
        error => {
          // show error details.
          this._spinner.hide();
          this.handleError(error);
        }
      );
    }
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
  // discount sign look up
  discSignLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DISC_SIGN').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.discSignList = [...this.discSignList, { discSignId: lkps.id, discSignValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // discount type lookup value
  discTypelookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DISC_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.discTypeList = [...this.discTypeList, { discTypeId: lkps.id, discTypeValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // to get the values from child search component
  getSearchVal(selected: any) {
    if (selected) {
      this.childCurrentValue = selected;
      this.batchNumber = this.childCurrentValue['batchNum'.toString()] == null ? '' : this.childCurrentValue['batchNum'.toString()];
      this.billNumbers = this.childCurrentValue['billNumbers'.toString()] == null ? '' : this.childCurrentValue['billNumbers'.toString()];
      this.loadData();
    }
  }
  // revised amount calculation based on type and type
  calculateRevisedVal() {
    console.log(this.discount);
    let i = 0;
    for (i = 0; i < this.discount.length; i++) {
      if (this.discount[i].discType === 'FLAT') {
        if (this.discount[i].discSign === 'POSITIVE') {
          if (this.discount[i].value == null) {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
            this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
            this.discount[i].discountVal = (Number(0)).toFixed(2);
          } else {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount) + Number(this.discount[i].value)).toFixed(2);
            this.discount[i].revisedGBillAmount = ((Number(this.discount[i].revisedBillAmount) * 1.18)).toFixed(2);
            this.discount[i].discountVal = (Number(this.discount[i].value)).toFixed(2);
          }
        } else if (this.discount[i].discSign === 'NEGATIVE') {
          if (this.discount[i].value == null) {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
            this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
            this.discount[i].discountVal = (Number(0)).toFixed(2);
          } else {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount) - Number(this.discount[i].value)).toFixed(2);
            this.discount[i].revisedGBillAmount = ((Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2));
            this.discount[i].discountVal = (Number(this.discount[i].value)).toFixed(2);
          }
        } else {
          this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
          this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
          this.discount[i].discountVal = (Number(0)).toFixed(2);
        }
      }
      if (this.discount[i].discType === 'PERCENTAGE') {
        if (this.discount[i].discSign === 'POSITIVE') {
          if (this.discount[i].value == null) {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
            this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
            this.discount[i].discountVal = (Number(0)).toFixed(2);
          } else {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount) +
              ((Number(this.discount[i].value) * Number(this.discount[i].amount)) / 100)).toFixed(2);
            this.discount[i].revisedGBillAmount = ((Number(this.discount[i].revisedBillAmount) * 1.18)).toFixed(2);
            this.discount[i].discountVal = (((Number(this.discount[i].value) * Number(this.discount[i].amount)) / 100)).toFixed(2);
          }
        } else if (this.discount[i].discSign === 'NEGATIVE') {
          if (this.discount[i].value == null) {
            this.discount[i].discountVal = (Number(0)).toFixed(2);
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
            this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
          } else {
            this.discount[i].revisedBillAmount = (Number(this.discount[i].amount) -
              ((Number(this.discount[i].value) * Number(this.discount[i].amount)) / 100)).toFixed(2);
            this.discount[i].revisedGBillAmount = ((Number(this.discount[i].revisedBillAmount) * 1.18)).toFixed(2);
            this.discount[i].discountVal = (((Number(this.discount[i].value) * Number(this.discount[i].amount)) / 100)).toFixed(2);
          }
        } else {
          this.discount[i].revisedBillAmount = (Number(this.discount[i].amount)).toFixed(2);
          this.discount[i].revisedGBillAmount = (Number(this.discount[i].revisedBillAmount) * 1.18).toFixed(2);
          this.discount[i].discountVal = (Number(0)).toFixed(2);
        }
      }

    }
  }

  // on row change push data to discount array
  toMoveData(row: DiscountData) {
    console.log(this.discountArray);
    let i = 0;
    for (i = 0; i < this.discount.length; i++) {
      if (this.discount[i].billId === row.billId) {
        this.remove(row);

      }
      if (this.discount[i].billId === row.billId) {
        this.remove(row);
        this.addArray(row);
      }
    }
  }

  addArray(row: DiscountData) {
    let i = 0;
    let flag = 0;
    // check if this data is already available in the discountArray
    for (i = 0; i < this.discountArray.length; i++) {
      if (this.discountArray[i].billId === row.billId) {
        flag = 1;
        break;
      }
    }
    // add data to discountArray
    if (flag === 0) {
      this.discountArray.push({
        billId: row.billId,
        discType: row.discType,
        discValue: row.value,
        discSign: row.discSign,
        baseAmt: row.amount,
        revisedBillAmount: Number(row.revisedBillAmount)
      });
    }
  }

  // remove if bill is already present in the discountArray
  remove(row: DiscountData) {
    let i = 0;
    for (i = 0; i < this.discountArray.length; i++) {
      if (this.discountArray[i].billId === row.billId) {
        this.discountArray.splice(i, 1);
      }
    }
  }

  // show error details.
  handleError(error: any) {
    if (error.error != null && error.error.errorMessage != null) {
      this._toastr.warning(error.error.errorMessage);
    } else {
      this._toastr.warning(error.message);
    }
  }

  // submit to call post service
  submit(): void {
    this.validateDiscountArray();
    if (this.discountArray.length === 0) {
      this._toastr.warning('No Data for Database Commit.');
    }
    if (!this._toastr.currentlyActive) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Application of positive/negative discount is an irreversible change, do you want to Continue?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          this.postDiscountData();
        } else {
          // do nothing.
        }
      });
    }
  }
  // data validations
  validateDiscountArray() {
    let i = 0;
    let _noValuesFound = 0;
    let _notValidPercentage = 0;
    let _notValidFlat = 0;

    for (i = 0; i < this.discountArray.length; i++) {
      if (this.discountArray[i].discSign == null || this.discountArray[i].discType == null
        || this.discountArray[i].discValue == null || this.discountArray[i].revisedBillAmount == null) {
        _noValuesFound = 1;
      }

      if (this.discountArray[i].discType === 'PERCENTAGE' && this.discountArray[i].discSign === 'NEGATIVE'
        && Number(this.discountArray[i].discValue) > 100) {
        _notValidPercentage = 1;
      }
      if (this.discountArray[i].discType === 'FLAT' && this.discountArray[i].discSign === 'NEGATIVE' &&
        Number(this.discountArray[i].discValue) > Number(this.discountArray[i].baseAmt)) {
        _notValidFlat = 1;
      }
    }
    if (_noValuesFound > 0) {
      this._toastr.warning('Either Disc Sign or Type or Value Can not be Empty ');
    }
    if (_notValidPercentage > 0) {
      this._toastr.warning('Percentage Can Not Be More than 100 for Negative Discount');
    }
    if (_notValidFlat > 0) {
      this._toastr.warning('Flat Can Not Be More than Actual Amount for Negative Discount');
    }
  }

  // to save the data in database
  postDiscountData() {
    this.validateDiscountArray();
    if (!this._toastr.currentlyActive) {
      this._spinner.show();
      this._discountService.postDiscountData(this.discountArray).subscribe(
        response => {
          this._spinner.hide();
          this.clearSearchValues = {} as DiscountSearch;
          this.discountArray = [];
          this.dataSource = new MatTableDataSource(null);
          this._toastr.success(response);
        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        });

    }
  }
  // on clicking clear
  clear() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog sent: ${result}`);
      if (result) {
        // page refresh.
        this.dataSource.paginator.pageIndex = 0;
        this.dataSource.paginator.pageSize = 5;
        this.discountArray = [];
        this.clearSearchValues = {} as DiscountSearch;
        this.dataSource = new MatTableDataSource(null);
      } else {
        // do nothing.
      }
    });
  }

  // errors string response function
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
}


