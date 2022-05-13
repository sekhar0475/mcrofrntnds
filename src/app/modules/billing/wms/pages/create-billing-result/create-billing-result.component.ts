import { Component, OnInit, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { WmsLines } from '../../models/wms-lines.model';
import { ServiceProvided } from '../../models/service-provided.model';
import { SearchResult } from '../../models/search-result.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { WmsBillingSave } from '../../models/wms-billing-save.model';
import { WmsService } from '../../services/wms.service';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { CustomersBillBranch } from '../../models/customers-bill-branch.model';
import { SearchParam } from '../../models/search-param.model';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { UserService } from 'src/app/modules/user-mangement/user/services/user.service';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { ConfirmationSuccessDialogComponent } from 'src/app/shared/components/confirmation-success-dialog/confirmation-success-dialog.component';

@Component({
  selector: 'app-create-billing-result',
  templateUrl: './create-billing-result.component.html',
  styleUrls: ['./create-billing-result.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class CreateBillingResultComponent implements OnInit {
  displayedColumns: string[] = ['lineNumber',
    'service', 'amount', 'remarks', 'sgst', 'cgst', 'igst', 'total', 'delete'];
    displayedColumnsTaxTotal: string[] = ['taxTotLbl','taxService','taxAmt','taxRemarks','sgstTot','cgstTot','igstTot','taxTot','taxDelete'];
    displayedColumnsFinTotal: string[] = ['finTotLbl','finService','finAmt','finRemarks','finSgst','finCgst','finIgst','finTot','finDelete'];

    serviceProvidedList: ServiceProvided[] = [];
  todayDate: Date = new Date();
  oneMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    new Date().getDate()
  );
  @Input() searchResult: SearchResult;
  wmsBillLines: WmsLines[] = [];
  @Input() customerBillBranch: CustomersBillBranch;
  @Input() searchData: SearchParam;
  @Input() displayResultComponent: boolean;
  @Output() displayResultComponentChange = new EventEmitter<string>();
  dataSource: MatTableDataSource<WmsLines> = new MatTableDataSource();
  isDisabledSubmit : boolean = true;
  wmsBillLinesData: WmsLines[];
  resultFormGroup: FormGroup;
  taxPercentage: number = 18;
  billStateCode = 'MM';
  gstStateCode = 'MM';
  oldCustomer = "";
  oldBranch = "";
  oldBillingLevel = "";
  oldSFXCode = "";
  toDateValue: Date;
  lastDateValue: Date;
  isbetween: boolean = false;
  isTotColumn: boolean = false;
  writeAccess : boolean = false;
  
  wmsBillingSave: WmsBillingSave = {
    billDt: null,
    blngBr: null,
    billToAddr: null,
    collBr: null,
    submsnBr: null,
    pymtTerm: null,
    contractEndDate: null,
    billId: null,
    billDate: null,
    billFromDt: null,
    billToDt: null,
    billType: null,
    billCtgy: null,
    billPeriod: null,
    custMsaId: null,
    custMsaCode: null,
    billToCustName: null,
    placeOfSupply: null,
    stateCode: null,
    gstNumber: null,
    sfxId: null,
    sfxCode: null,
    blngCycle: null,
    collBrId: null,
    altCollBrId: null,
    altCollBr: null,
    submsnBrId: null,
    baseAmt: null,
    wmsBIllLines: null,
    billingLevel: null,
    billingLevelCode: null,
    totalCgstAmt : 0,
    totalIgstAmt : 0,
    totalSgstAmt : 0,
    gstApplied : null,
    blngBrId : null,
    billingLevelId : null,
    bkgBrId : null,
    bkgBr : null,
    billToAddrId : null,
    billToAddrLine1 : null,
    billToAddrLine2 : null ,
    billToAddrLine3 : null,
    billToLocation : null,
    billToPincode : null,
    ebillFlag : null,
    billingBrAddress : null,
    billingBrLocation : null,
    billingBrGstNum : null,
    ebillEmail : null,
    rateCardId : null,
    rateCardCode : null
  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private _route: ActivatedRoute
    , private _router: Router
    , public _dialogs: MatDialog
    , public _toastr: ToastrService
    , private _spinner: NgxSpinnerService
    , private _wmsService: WmsService
    , private _tokenStorage : TokenStorageService
    , private _lookupService : LookupService
    ) {

  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.oldCustomer = this.searchData.custName;
    this.oldBranch = this.searchData.billBranch;
    this.oldBillingLevel = this.searchData.billLevel;
    this.oldSFXCode = this.searchData.billingLevelCode;
    this.loadData();
    this.initForm();
    //this._detectChanges.detectChanges();
    if (this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y') {
      this.writeAccess = true;
    } 
    console.log("Before hans");
    console.log(this.customerBillBranch);
    console.log("Before setting");
    this.wmsBillingSave.billToAddrId = this.customerBillBranch.billToAddrId;
    this.wmsBillingSave.ebillFlag = this.customerBillBranch.ebillFlag;
    this.wmsBillingSave.ebillEmail = this.customerBillBranch.ebillEmail;
    console.log("Before aaaa");
    console.log(this.wmsBillingSave);


  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // To Add new Permissions
  public addNewRow() {
    console.log("customerBillBranch.gstNumber = "+this.customerBillBranch.gstNumber);
    console.log("this.billStateCode = "+this.billStateCode);
    if (typeof this.customerBillBranch.gstNumber === 'undefined'){
      this._toastr.error("No Customer GST Number Found.");
    }else if (typeof this.billStateCode === 'undefined'){
      this._toastr.error("No Company GST Number Found.");
    }else{
      this.dataSource.data.push({
        lineNumber: (this.dataSource.data.length + 1).toString(),
        serviceName: null,
        lineAmt: null,
        remarks: null,
        sgstAmt: 0,
        cgstAmt: 0,
        igstAmt: 0,
        ttlTaxAmt: 0,
        isTotColumn: null,
        ttlLineAmt : 0
      });
      this.dataSource = new MatTableDataSource(this.dataSource.data);
      this.dataSource.paginator = this.paginator;
   
    }

    }

  loadData() {
    this._spinner.show();
    this._wmsService.getWmsBiling(this.searchData.custName, this.searchData.billBranch, this.searchData.billLevel, this.searchData.billingLevelCode).subscribe
      (
        success => {
          if(success.gstApplied === 'Y'){
            this.resultFormGroup.controls.billGstCheck.setValue(true);
          }else{
            this.resultFormGroup.controls.billGstCheck.setValue(false);
          }
          this._wmsService.getWmsBilingLines(success.billId).subscribe
            (
              result => {
                this.dataSource = new MatTableDataSource();
               
                result.forEach(element => {
                  this.dataSource.data.push(element);
                });

                this.dataSource.paginator = this.paginator;
              }, error => {
                this._spinner.hide();
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
            );

        }, error => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource();
          this.dataSource.paginator = this.paginator;

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
      );
      //User Branch API call for GST NUM
      this._lookupService.getBranchData(Number(this.searchData.billBranch)).subscribe(
        response => {
          console.log(response.data);
          this.billStateCode = response.data.branchGstNum;
          this.wmsBillingSave.billingBrAddress = response.data.address;
          this.wmsBillingSave.billingBrGstNum = response.data.branchGstNum;
          this.wmsBillingSave.billingBrLocation = response.data.address;
      },
      error => {
        this._spinner.hide();
        this._toastr.warning((error.message));
      });
      
    this._wmsService.getLookupValuesByType('WMS_SERVICE_PROVIDED').subscribe(
      response => {
        this.serviceProvidedList = [];
        response.data.forEach(
          lkps => {
            this.serviceProvidedList = [...this.serviceProvidedList, { serviceId: lkps.id, serviceName: lkps.descr }];

          });
          
        this._spinner.hide();
      },
      error => {
        this._spinner.hide();
      });
    
  }

  initForm() {
    this.resultFormGroup = new FormGroup({
      billDateFc: new FormControl(new Date(), [Validators.required]),
      billPeriodFromFc: new FormControl('', [Validators.required]),
      billPeriodToFc: new FormControl('', [Validators.required]),
      billGstCheck: new FormControl(''),

    });
    this.resultFormGroup.controls.billGstCheck.setValue(true);
  }

  deleteWmsLines(index) {
    this.dataSource.data.splice(index, 1);
    let srNo = 1;
    this.dataSource.data.forEach(element => {
      element.lineNumber = srNo.toString();
      srNo++;
    });
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
  }

  back() {
    const dialogRef = this._dialogs.open(ConfirmationDialogComponent, {
      data: 'Are you sure ?' , disableClose: true 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._router.navigate(['dashboard']);
      }
    });
  }

  submit() {
    this.wmsBillLinesData = [];
    this.removeOrAddTax();
    this.dataSource.data.forEach(data => {

      if (data.lineNumber != 'Sub Total' && data.lineNumber != 'Total') {
        this.wmsBillLinesData.push(
          {
            lineNumber: (1).toString(),
            serviceName: data.serviceName,
            lineAmt: data.lineAmt,
            remarks: data.remarks,
            sgstAmt: data.sgstAmt,
            cgstAmt: data.cgstAmt,
            igstAmt: data.igstAmt,
            ttlTaxAmt: data.ttlTaxAmt,
            isTotColumn: "false",
            ttlLineAmt : data.ttlLineAmt
          });
      }

    });
    this.prepareDataToInsert(this.wmsBillLinesData, this.customerBillBranch);
    if (!this.isbetween) {
      this._spinner.show();
      this._wmsService.saveWmsBilling(this.wmsBillingSave).subscribe
        (
          success => {
            console.log(success);
            this._spinner.hide();
        const dialogRef = this._dialogs.open(ConfirmationSuccessDialogComponent, {​​​​​​​​
            data: {​​​​​​​​value: success.message, message: 'WMS bill created successfully.' }​​​​​​​​,
            disableClose: true
          }​​​​​​​​);

            this.displayResultComponentChange.emit("saved");
          }, error => {
            this._spinner.hide();
            if (error.error != null) {
              if (error.error.errorCode === 'handled_exception') {
                this._toastr.error((error.error.errorMessage));
              } else {
                this._toastr.error(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
              }
            } else {
              this._toastr.error(error.message);
            }
          }
        );

    }


  }

  calcTax(index) {
    console.log("billStateCode="+this.billStateCode);
    console.log(this.customerBillBranch.gstNumber);
    console.log(this.billStateCode);
    let tempWmsBill = this.dataSource.data[index];
    let tempBillGstCheck =  this.resultFormGroup.get('billGstCheck').value;
    let tempAmt = tempWmsBill.lineAmt;
    if(tempBillGstCheck){
     if ((this.customerBillBranch.gstNumber != undefined && (this.customerBillBranch.gstNumber).substring(0,2)) === (this.billStateCode != undefined && (this.billStateCode).substring(0,2))) {
        let tempEachPercentage = this.taxPercentage / 2;
        tempWmsBill.cgstAmt = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
        tempWmsBill.sgstAmt = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
        tempWmsBill.igstAmt = 0;
        console.log("IF");
      } else {
        console.log("else");
        let tempEachPercentage = this.taxPercentage;
        tempWmsBill.cgstAmt = 0;
        tempWmsBill.sgstAmt = 0;
        tempWmsBill.igstAmt = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
      }
    }
    tempWmsBill.ttlTaxAmt =  Number(tempAmt.toFixed(2));
    //tempWmsBill.lineAmt = Number(tempWmsBill.lineAmt.toFixed(2));
    this.dataSource.data[index] = tempWmsBill;
    this.dataSource.paginator = this.paginator;
    
   }

  public prepareDataToInsert(wmsBillLines, customerData) {
     console.log("In prepare data");
     console.log(customerData);
    let billDateFc = this.resultFormGroup.get('billDateFc').value;
    let billPeriodFromFc = this.resultFormGroup.get('billPeriodFromFc').value;
    let billPeriodToFc = this.resultFormGroup.get('billPeriodToFc').value;
    let tempBillGstCheck =  this.resultFormGroup.get('billGstCheck').value;
    let isGstApplied = "N";
    if(tempBillGstCheck){
      isGstApplied = "Y";
    }
    /*this.isbetween = this.checkBeetweenDate(billPeriodFromFc, billPeriodToFc, customerData.contractExpiryDate);
    if (this.isbetween) {
      this._toastr.error('This WMS Contract End date is between the Bill date Range. Please update the Contract End Date in Propel-I');
    }*/
    this.wmsBillingSave.blngBrId = customerData.billBranchId;
    this.wmsBillingSave.wmsBIllLines = wmsBillLines;
    this.wmsBillingSave.altCollBr = customerData.altCollBr;
    this.wmsBillingSave.altCollBrId = customerData.altCollBrId;
    this.wmsBillingSave.baseAmt = this.getLineTotal();
    this.wmsBillingSave.blngBr = customerData.billbranch;
    this.wmsBillingSave.billCtgy = customerData.billCtgy;
    this.wmsBillingSave.billDate = this.convert(billDateFc);
    this.wmsBillingSave.billDt = this.convert(billDateFc);
    this.wmsBillingSave.billFromDt = this.convert(billPeriodFromFc);
    this.wmsBillingSave.billPeriod = "";
    this.wmsBillingSave.billToAddr = customerData.billToAddress;
    this.wmsBillingSave.billToCustName = customerData.billToCustName;
    this.wmsBillingSave.billToDt = this.convert(billPeriodToFc);
    this.wmsBillingSave.billType = customerData.billType;
    this.wmsBillingSave.blngCycle = "";
    this.wmsBillingSave.collBr = customerData.colBr;
    this.wmsBillingSave.collBrId = customerData.colBrId;
    this.wmsBillingSave.contractEndDate = customerData.contractExpiryDate;
    this.wmsBillingSave.custMsaCode = customerData.customerCode;
    this.wmsBillingSave.custMsaId = customerData.custMsaId;
    this.wmsBillingSave.gstNumber = customerData.gstNumber;
    this.wmsBillingSave.placeOfSupply = customerData.placeOfSupply;
    this.wmsBillingSave.pymtTerm = customerData.pymtTermName;
    this.wmsBillingSave.sfxCode = customerData.sfxCode;
    this.wmsBillingSave.sfxId = customerData.sfxId;
    this.wmsBillingSave.stateCode = customerData.stateCode;
    this.wmsBillingSave.submsnBr = customerData.submsnBr;
    this.wmsBillingSave.submsnBrId = customerData.submsnBrId;
    this.wmsBillingSave.billingLevel = customerData.billingLevel;
    this.wmsBillingSave.billingLevelCode = customerData.billingLevelCode;
    this.wmsBillingSave.totalSgstAmt = this.getSgstTotal();
    this.wmsBillingSave.totalCgstAmt = this.getCgstTotal();
    this.wmsBillingSave.totalIgstAmt = this.getIgstTotal();
    this.wmsBillingSave.gstApplied = isGstApplied;
    this.wmsBillingSave.bkgBr = "";
    this.wmsBillingSave.bkgBrId = 0;
    this.wmsBillingSave.billToAddrId = customerData.billToAddrId;
    this.wmsBillingSave.billToAddrLine1 = customerData.billToAddrLine1;
    this.wmsBillingSave.billToAddrLine2 = customerData.billToAddrLine2 ;
    this.wmsBillingSave.billToAddrLine3 = customerData.billToAddrLine3;
    this.wmsBillingSave.billToLocation = customerData.billToLocation;
    this.wmsBillingSave.billToPincode = customerData.billToPincode;
    this.wmsBillingSave.ebillFlag = customerData.ebillFlag;
    this.wmsBillingSave.rateCardId = customerData.rateCardId;
    this.wmsBillingSave.rateCardCode = customerData.rateCardCode;
    
    this.wmsBillingSave.billingLevelId = this.searchResult.billingLevelId;

    console.log(this.wmsBillingSave);
  }

  // public checkBeetweenDate(fromDt, toDt, chkDt) {
  //   console.log("fromDt "+fromDt);
  //   console.log("toDt "+toDt);
  //   console.log("chkDt "+chkDt);
  //   let isDateBetween: boolean = false;
  //   let compareDate = Date.parse(chkDt);
  //   let startDate = Date.parse(fromDt);
  //   let endDate = Date.parse(toDt);
  //   if (compareDate < endDate && compareDate > startDate) {
  //     isDateBetween = true;
  //   }

  //   return isDateBetween;

  // }

 
  ngDoCheck() {
    if(this.oldCustomer !== this.searchData.custName 
      || this.oldBranch !== this.searchData.billBranch 
      || this.oldBillingLevel !== this.searchData.billLevel 
      || this.oldSFXCode !== this.searchData.billingLevelCode) {
        this.loadData();
        this.oldCustomer = this.searchData.custName;
        this.oldBranch = this.searchData.billBranch;
        this.oldBillingLevel = this.searchData.billLevel;
        this.oldSFXCode = this.searchData.billingLevelCode;
      
    }
    
 }


 removeOrAddTax() {
  
  this.dataSource.data.forEach(data => {
      if (data.lineNumber != "Sub Total" && data.lineNumber != "Total") {
        let tempBillGstCheck =  this.resultFormGroup.get('billGstCheck').value;
        if(tempBillGstCheck){
          if ((this.customerBillBranch.gstNumber != undefined && (this.customerBillBranch.gstNumber).substring(0,2)) === (this.billStateCode != undefined && (this.billStateCode).substring(0,2))) {
            let tempEachPercentage = this.taxPercentage / 2;
            data.cgstAmt = Number(((data.lineAmt * tempEachPercentage) / 100).toFixed(2));
            data.sgstAmt = Number(((data.lineAmt * tempEachPercentage) / 100).toFixed(2));
            data.igstAmt = 0;
          } else {
            let tempEachPercentage = this.taxPercentage;
            data.cgstAmt = 0;
            data.sgstAmt = 0;
            data.igstAmt = Number(((data.lineAmt * tempEachPercentage) / 100).toFixed(2));
          }
          //}
          data.ttlTaxAmt = Number((Number((data.cgstAmt + data.sgstAmt + data.igstAmt).toFixed(2)) + data.lineAmt).toFixed(2));
        
        }else{
          data.cgstAmt = 0;
          data.sgstAmt = 0;
          data.igstAmt = 0;
          data.ttlTaxAmt = data.lineAmt;
          
        
        }
      
      }

    });

    }


    getIgstTotal() {
      return this.dataSource.data.map(t => t.igstAmt).reduce((acc, value) => acc + value, 0);
    }

    getSgstTotal() {
      return this.dataSource.data.map(t => t.sgstAmt).reduce((acc, value) => acc + value, 0);
    }

    getCgstTotal() {
      return this.dataSource.data.map(t => t.cgstAmt).reduce((acc, value) => acc + value, 0);
    }

    getTaxTotal() {
      return this.getIgstTotal() + this.getSgstTotal() + this.getCgstTotal();
    }

    getFinTotal() {
      return (this.getIgstTotal() + this.getSgstTotal() + this.getCgstTotal() + this.getLineTotal()).toFixed(2);
    }

    getLineTotal() {
      return this.dataSource.data.map(t => t.lineAmt).reduce((acc, value) => acc + value, 0);
    }

    setDateValue(selectedDate) {
      console.log(selectedDate);
      this.toDateValue = selectedDate.value;
      var lastDay = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0);
      this.lastDateValue = lastDay;
      this.resultFormGroup.controls.billPeriodToFc.setValue(lastDay);
    }

// to convert system generated date for search in database
  convert(str) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

} 
