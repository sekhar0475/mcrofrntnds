import { SelectionModel } from '@angular/cdk/collections';
import { SimpleChanges, ViewChild } from '@angular/core';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationSuccessDialogComponent } from 'src/app/shared/components/confirmation-success-dialog/confirmation-success-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { RandomCreditCustomerDetails } from '../../models/random-creditcust.model';
import { RandomSearchParam } from '../../models/random-waybill-search-request.model';
import { RandomWaybillsResult } from '../../models/random-waybills-result.model';
import { SelectedWaybillData, Waybills } from '../../models/selected-waybill.model';
import { RandomBillingService } from '../../services/random-billing.service';

@Component({
  selector: 'app-credit-random-result',
  templateUrl: './credit-random-result.component.html',
  styleUrls: ['./credit-random-result.component.scss']
})
export class CreditRandomResultComponent implements OnChanges, OnInit {

  displayedWayBillColumns: string[] = ['select', 'waybillNumber', 'sfxCode', 'pickupDate', 'originCode', 'destinationCode'
    , 'pkg', 'weight', 'outstandingAmount'];

  errorMessage: ErrorMsg;

  dataSource: MatTableDataSource<RandomWaybillsResult> = new MatTableDataSource();
  selection = new SelectionModel<RandomWaybillsResult>(true, []);
  waybillCount: number;
  selectedWaybillCount: number;

  @Input() randomSearchParam: RandomSearchParam;
  @Input() creditCustDetails: RandomCreditCustomerDetails[] = [];
  @Input() fromDate: string;
  @Input() toDate: string;
  @Input() waybillNumbers: string;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output('emitterClearSearchParams') clearSearchParams = new EventEmitter<boolean>(false);


  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _randomBillingService: RandomBillingService
  ) { }

  ngOnInit(): void {
    // this.dataSource.filterPredicate =
    //   (data: RandomWaybillsResult, filters: string) => {
    //     const matchFilter = [];
    //     const customFilter = [];
    //     const filterArray = filters.split(',');
    //     const columns = [data.waybillNumber];
    //     //(<any>Object).values(data); // for all columns

    //     console.log('columns', columns);

    //     // Main
    //     filterArray.forEach(filter => {
    //       columns.forEach(column => customFilter.push(column.toLowerCase().includes(filter)));
    //       matchFilter.push(customFilter.some(Boolean)); // OR
    //     });
    //     return matchFilter.every(Boolean); // AND
    //   }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadData();
  }


  loadData() {
    this._spinner.show();
    this.selection.clear();
    this._randomBillingService.getRandomWaybills(this.randomSearchParam).subscribe(response => {

      console.log(response.data);

      this._spinner.hide();
      if (response.data == null) {
        this._toastr.warning(response.message);
      } else {
         console.log("resp count", response.data.wbBlngDetailsResp.waybillCount);
        let dummyData :RandomWaybillsResult[] = [];
        this.dataSource = new MatTableDataSource(dummyData);
        this.waybillCount = response.data.wbBlngDetailsResp.waybillCount;
        console.log(this.waybillCount);
        let currentWaybillData = [];
        currentWaybillData = response.data.wbBlngDetailsResp.waybills;
        let waybillNumbers = [];
        let trimmedWaybills= [];
        if(this.waybillNumbers != null) {
          waybillNumbers = this.waybillNumbers.trim().split(',');

          waybillNumbers.forEach((w) => {
           trimmedWaybills.push(w.trim());
         });
         }

         console.log("before waybill waybillNumbers trimmedWaybills");


        if(this.waybillNumbers && this.waybillNumbers.length > 1) {

          console.log('before waybill currentWaybillData' ,currentWaybillData);
        currentWaybillData.forEach((waybill) => {
          console.log("inside for each waybill waybillNumbers trimmedWaybills");
          // if ((trimmedWaybills[0] == '') || trimmedWaybills.includes(waybill.waybillNumber.toString(), 0))
          if((trimmedWaybills[0] == '') || trimmedWaybills.includes(waybill.waybillNumber.toString(),0)) {
            this.addNewWayBillLineInTable(waybill.baseAmount, waybill.cgstAmount, waybill.createdDate, waybill.deliveryDate, waybill.destinationCode, waybill.destinationId, waybill.igstAmount, waybill.originCode,
              waybill.originId, waybill.outstandingAmount, waybill.pickupDate, waybill.pkg, waybill.sfxCode, waybill.sgstAmount, waybill.ttlTaxAmount
              , waybill.waybillId, waybill.waybillNumber, waybill.weight);
          }});
      } else {
        this.dataSource.data = currentWaybillData;
      }
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log("outside for each waybill waybillNumbers trimmedWaybills");
      }

    },
      error => {
        // show error details.
        this._spinner.hide();
        this.handleError(error);
      });
  }

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

  checkboxLabel(row?: RandomWaybillsResult): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
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
      this._spinner.show();

      this._randomBillingService.postRandomWaybills(this.createDataRequest(this.creditCustDetails, this.selection.selected))
        .subscribe(
          (response) => {
            this._spinner.hide();
            this.forceReset();
            const dialogRef = this._dialog.open(
              ConfirmationSuccessDialogComponent,
              {
                data: {
                  value: response,
                  message: "Random Batch Creation Request Initiated",
                },
                disableClose: true,
              }
            );
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                // this._router.navigate(["/dashboard"]);
              } else {
                this.forceReset();
              }
            });
            this.selection.clear();
          },
          (error) => {
            // show error details.
            this._spinner.hide();
            this.handleStringError(error);
          }
        );
    }
  }

  // create request for billing
  createDataRequest(customerDetails: RandomCreditCustomerDetails[], waybillData: RandomWaybillsResult[]) {
    console.log(customerDetails);

    let newRequest: RandomCreditCustomerDetails[] = [];
    let newSelectedWaybillData: SelectedWaybillData = {} as SelectedWaybillData;

    // _randomBillingService
    const custDetails =  customerDetails.filter(element => element.billingByOptionId === this._randomBillingService.selectedBillingOptionsID)

    newSelectedWaybillData.waybillCount = this.waybillCount;
    newSelectedWaybillData.selectedWaybillCount = this.selection.selected.length;
    let newWaybills: Waybills[] = [];
    waybillData.forEach(waybill => {
      newWaybills.push({
        waybillId: waybill.waybillId,
        waybillNumber: waybill.waybillNumber,
        creationDate: waybill.createdDate.toString(),
        deliveryDate: waybill.deliveryDate ? waybill.deliveryDate.toString() : "",
        pickupDate: waybill.pickupDate.toString(),
        baseAmount: waybill.baseAmount.toString(),
        igstAmount: waybill.igstAmount.toString(),
        cgstAmount: waybill.cgstAmount.toString(),
        sgstAmount: waybill.sgstAmount.toString(),
        ttlTaxAmount: waybill.ttlTaxAmount.toString(),
        outstandingAmount: waybill.outstandingAmount.toString()
      })
    })
    newSelectedWaybillData.waybills = newWaybills;
    newRequest.push({
      billingLevel: custDetails[0].billingLevel,
      billingLevelValue: custDetails[0].billingLevelValue,
      billingLevelId: custDetails[0].billingLevelId,
      billToAddr: custDetails[0].billToAddr,
      billingByLevel: custDetails[0].billingByLevel,
      billingByLevelId: custDetails[0].billingByLevelId,
      billingByOptionId: custDetails[0].billingByOptionId,
      billingCycleId: custDetails[0].billingCycleId,
      billingCycle: custDetails[0].billingCycle,
      billingConfigId: custDetails[0].billingConfigId,
      serviceOfferingId: custDetails[0].serviceOfferingId,
      pymtTermName: custDetails[0].pymtTermName,
      billingFromDate: this.fromDate,
      billingEndDate: this.toDate,
      businessType: custDetails[0].businessType,
      assgnbranchIds:custDetails[0].assgnbranchIds,
      blngBr: custDetails[0].blngBr,
      blngBrId: custDetails[0].blngBrId,
      collBr: custDetails[0].collBr,
      collBrId: custDetails[0].collBrId,
      submsnBr: custDetails[0].submsnBr,
      submsnBrId: custDetails[0].submsnBrId,
      aliasName: custDetails[0].aliasName,
      msaName: custDetails[0].msaName,
      msaId: custDetails[0].msaId,
      gstNum: custDetails[0].gstNum,
      gstinRegdFlag: custDetails[0].gstinRegdFlag,
      msaCode: custDetails[0].msaCode,
      sfxId: custDetails[0].sfxId,
      sfxCode: custDetails[0].sfxCode,
      rateCardId: custDetails[0].rateCardId,
      rateCardCode: custDetails[0].rateCardCode,
      email: custDetails[0].email,
      eBillFlag: custDetails[0].eBillFlag,
      billToAddrId: custDetails[0].billToAddrId,
      billToAddrLine1: custDetails[0].billToAddrLine1,
      billToAddrLine2: custDetails[0].billToAddrLine2,
      billToAddrLine3: custDetails[0].billToAddrLine3,
      billToLocation: custDetails[0].billToLocation,
      billToPincode: custDetails[0].billToPincode,
      billToCity: custDetails[0].billToCity,
      billToState: custDetails[0].billToState,
      branchIds: custDetails[0].branchIds,
      autoBillFlag: custDetails[0].autoBillFlag,
      businessTypeId: custDetails[0].businessTypeId,
      minBlngAmt: custDetails[0].minBlngAmt,
      subTypeId: custDetails[0].subTypeId,
      subType: custDetails[0].subType,
      subTypeValue: custDetails[0].subTypeValue,
      waybillsData: newSelectedWaybillData
    });
    return newRequest[0];
  }


  // errors function
  handleError(error: any) {
    if (error.error != null) {
      if (error.error.errorCode === 'handled_exception') {
        this._toastr.warning(error.error.errorMessage);
      } else {
        this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
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
      if (this.errorMessage.errorCode === 'handled_exception') {
        this._toastr.warning((this.errorMessage.errorMessage));
      } else {
        this._toastr.warning(this.errorMessage.errorMessage + ' Details: ' + this.errorMessage.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }


  forceReset() {
    console.log('Force reset: STARTED');
    // this.deleteAllLines();
    this._randomBillingService.selectedBillingOptionsID = null;
    this.clearSearchParams.emit(true);
    console.log('Force reset: DONE');
  }

  reset() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.forceReset();
      }
    });
  }

  // for comma separted search
  applyFilter() {

    const filterValue = this.waybillNumbers;
    // (event.target as HTMLInputElement).value;

    let currentWaybillData = this.dataSource.data;

    let dummyData :RandomWaybillsResult[] = [];
    this.dataSource = new MatTableDataSource(dummyData);

    let waybillNumbers =[];
    if (filterValue != null || filterValue !== '') {
      waybillNumbers= filterValue.split(',');
      console.log('waybillNumbers',waybillNumbers);

      currentWaybillData.forEach((waybill) => {
      if ((waybillNumbers[0] == '') || waybillNumbers.includes(waybill.waybillNumber.toString(), 0)) {
        this.addNewWayBillLineInTable(waybill.baseAmount, waybill.cgstAmount, waybill.createdDate, waybill.deliveryDate, waybill.destinationCode, waybill.destinationId, waybill.igstAmount, waybill.originCode,
          waybill.originId, waybill.outstandingAmount, waybill.pickupDate, waybill.pkg, waybill.sfxCode, waybill.sgstAmount, waybill.ttlTaxAmount
          , waybill.waybillId, waybill.waybillNumber, waybill.weight);
      }
    });
  } else {
   this.loadData();
   }
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addNewWayBillLineInTable(
    baseAmt, cgstAmt, createdDt, deliveryDt, destCode, destId, igstAmt, origCode, origId, outstandingAmt, pickupDt,
    pakg, sfxCde, sgstAmt, ttlTaxAmt, waybilId, waybilNumber, weight) {
    const element = {
      baseAmount: baseAmt,
      cgstAmount: cgstAmt,
      createdDate: createdDt,
      deliveryDate: deliveryDt,
      destinationCode: destCode,
      destinationId: destId,
      igstAmount: igstAmt,
      originCode: origCode,
      originId: origId,
      outstandingAmount: outstandingAmt,
      pickupDate: pickupDt,
      pkg: pakg,
      sfxCode: sfxCde,
      sgstAmount: sgstAmt,
      ttlTaxAmount: ttlTaxAmt,
      waybillId: waybilId,
      waybillNumber: waybilNumber,
      weight: weight
    };
    this.dataSource.data.push(Object.assign({}, element));
    this.dataSource = new MatTableDataSource(this.dataSource.data);
  }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value
  //    const filters = filterValue.trim().toLowerCase();
  //    this.dataSource.filter = filters;
  //   }
  // console.log(filterValue);

  //   if (!this.dataSource || !this.dataSource.data.length) { return []; }

  //   if (!filterValue) { return this.dataSource; }

  //   return this.dataSource.data.filter(item => Object.keys(item).some(key =>
  //     filterValue.split(',').some(arg =>
  //       item[key].toLowerCase().includes(arg.toLowerCase()))));
  // };
}

