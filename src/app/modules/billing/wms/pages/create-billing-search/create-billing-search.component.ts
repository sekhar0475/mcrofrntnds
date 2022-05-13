import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { WmsService } from '../../services/wms.service';
import { BIllingLevel } from '../../models/billing-level.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SearchParam } from '../../models/search-param.model';
import { SearchResult } from '../../models/search-result.model';
import { WmsLines } from '../../models/wms-lines.model';
import { Customers } from '../../models/customers.model';
import { BillBranch } from '../../models/bill-branch.model';
import { WmsBillingSave } from '../../models/wms-billing-save.model';
import { LookupType } from 'src/app/modules/billing/wms/models/lookup-type.model';
import { CustomersBillBranch } from '../../models/customers-bill-branch.model';
import { CustomerContract } from '../../models/customer-contract.model';
import { CustomerSearchComponent } from '../customer-search/customer-search.component';
import { Customer } from 'src/app/modules/collection/receipt/models/customer';
import { BillCustomer } from '../../models/bill-customer.model';
import { BranchSearchComponent } from '../branch-search/branch-search.component';
import { BillLevelCode } from '../../models/bill-level-code.model';
import { CustomerSearchDialogComponent } from '../customer-search-dialog/customer-search-dialog.component';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';


@Component({
  selector: 'app-create-billing-search',
  templateUrl: './create-billing-search.component.html',
  styleUrls: ['./create-billing-search.component.scss']
})
export class CreateBillingSearchComponent implements OnInit {
  createFormGroup: FormGroup;
  billingLevelList: BIllingLevel[] = [];
  originalBillingLevelList: BIllingLevel[] = [];
  customers: string[] = ['hans', 'Customer 2', 'Customer 3', 'Customer 4'];
  customerList: BillCustomer[] = [];
  branchList: BillBranch[] = [];
  lookupType: LookupType[] = [];
  customersBillBranch: CustomersBillBranch[] = [];
  billBranchs: string[] = ['Delhi', 'Banglore', 'Kolkata', 'Mumbai'];
  filteredCustomers: Observable<string[]>;
  filteredBillBranch: Observable<string[]>;
  customer = new FormControl();
  billBranch = new FormControl();
  selectedCustCode : string;
  selectedMsaId : number;
  selectedBranchId : number;
  selectedBillingLevelId : number;
  customerBillBranch = new CustomersBillBranch();
  isDataSaved : string;
  selectedBillingLvlValue : string;
  selectedBillingLvl : string;
  searchResult: SearchResult = {
    billBr: null,
    billToAddr: null,
    collBr: null,
    submsnBr: null,
    pymtTerm: null,
    contractEndDate: null,
    billId: null,
    ttlTaxAmt: 0,
    cgstAmt: 0,
    igstAmt: 0,
    sgstAmt: 0,
    collBrId : 0,
    billBrId : 0,
    gstApplied : null,
    billingLevelId : null
  };
  displayResultComponent = false;
  searchForm: SearchParam = {
    custName: null,
    billBranch: null,
    billLevel: null,
    billingLevelCode: null
  };
  searchData: SearchParam = {
    custName: null,
    billBranch: null,
    billLevel: null,
    billingLevelCode: null
  };
  //billingLevelList : LookupType[] = [];
  wmsBillLines: WmsLines[] = [];
  billingLevelValues = [];
  billingLevelsData = [];
  bilngLvlAndBilngCode : BillLevelCode[] =[]
  bilngLvlAndBilngCodeList : BillLevelCode[] =[]
  customerContract : CustomerContract = {
    "autoBillFlag": "N",
    "billingCycle": "ALL",
    "billingLevel": "",
    "customerName": "",
    "msaCode": "",
    "serviceLine": "",
    "sfxCode": "",
    "type": ""
  };

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
    billingLevel : null,
    billingLevelCode : null,
    totalCgstAmt : 0,
    totalIgstAmt : 0,
    totalSgstAmt : 0,
    gstApplied : null,
    billingLevelId : null,
    blngBrId : null,
    bkgBr : null,
    bkgBrId : null,
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
  constructor(
    private _wmsService: WmsService,
    private _spinner: NgxSpinnerService,
    public _toastr: ToastrService
  , private _cd: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _lookupService: LookupService
  ) {

  }

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.serviceLineLookUp();
    //this.loadCustomerData();

    this.filteredCustomers = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredBillBranch = this.billBranch.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBranch(value))
    );
    this._spinner.hide();
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      customerFc: new FormControl('', [Validators.required]),
      billBranchFc: new FormControl('', [Validators.required]),
      billLevelFc: new FormControl('', [Validators.required]),
      billLevelCodeFc: new FormControl('', [Validators.required]),

    });
  }

  loadData() {
    this._spinner.show();
    this._wmsService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
      //  this._spinner.hide();
        this.lookupType = response.data;

        this.lookupType.forEach(
          billLevel => {
            //if(billLevel.descr != 'MSA'){
              this.billingLevelList = [...this.billingLevelList, { billingLevelId: billLevel.id, billingLevelName: billLevel.descr }];
              this.originalBillingLevelList = [...this.originalBillingLevelList, { billingLevelId: billLevel.id, billingLevelName: billLevel.descr }];

            //}

          });
       //console.log(this.billingLevelList);
       //this._spinner.hide();

      },
      error => {
        this._spinner.hide();
      });
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.customers.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _filterBranch(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.billBranchs.filter(street => this._normalizeValue(street).includes(filterValue));
  }
  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  // post data into the database
  public submit() {
    if (!this._toastr.currentlyActive) {
      this.displayResultComponent = false;
      let billlevel = this.selectedBillingLevelId.toString();
      let billlevelcode = this.createFormGroup.get('billLevelCodeFc').value;
      let wmsBillId = 0;
      this.searchData.custName = this.selectedMsaId.toString();
      this.searchData.billBranch = this.selectedBranchId.toString();
      this.searchData.billLevel = billlevel;
      //console.log("In submit");
      //console.log("selectedCustCode"+this.selectedCustCode);


      this.searchData.billingLevelCode = billlevelcode;
         this.customersBillBranch.forEach(branchData => {
          if (branchData.customerCode === this.selectedCustCode && branchData.billBranchId === this.selectedBranchId) {

            this.searchResult.billBr = branchData.billbranch;
            this.searchResult.billToAddr = branchData.billToAddress,
              this.searchResult.collBr = branchData.colBr,
              this.searchResult.submsnBr = branchData.submsnBr,
              this.searchResult.pymtTerm = branchData.pymtTermName,
              this.searchResult.contractEndDate = branchData.contractExpiryDate.toString(),
              this.searchResult.billId = wmsBillId,
              this.searchResult.ttlTaxAmt = 0,
              this.searchResult.cgstAmt = 0,
              this.searchResult.igstAmt = 0,
              this.searchResult.sgstAmt = 0,
              this.searchResult.collBrId = branchData.colBrId,
              this.searchResult.billBrId = branchData.billBranchId
              this.searchResult.billingLevelId = this.selectedBillingLevelId;
            this.setCustomerBillBranch(branchData);
            this.displayResultComponent = true;
          }
        });

        //this._spinner.hide();
    }
  }

  public loadCustomerData(msaCodePar : string,accountType : string) {
    this._spinner.show();
    console.log("acc-"+accountType);
    console.log(this.customerContract);
    this.customerContract.type = accountType;
    this.customerContract.msaCode = msaCodePar;
    this._wmsService.getCustomerData(this.customerContract).subscribe
      (
        (result) => {
          this.billingLevelsData=[];
          this.bilngLvlAndBilngCode=[];
          this.customersBillBranch = [];
          const custData = result.data.custContResp;
          console.log(custData);
          custData.forEach(element => {

            this.customerList.push({
              branchName: element.colBr,
              custName: element.custName,
              collectionBranchId : element.colBrId,
              custMsaCode : element.propelMSACode,
              custMsaId : element.msaId,
              billingLevel : element.billingInfo[0].billingLevel
            });

            this.selectedMsaId = element.msaId;

            this.billingLevelsData.push(element.billingInfo[0].billingLevel);
            const billingConfigs = element.billingInfo[0].billingConfigs;
            let sfxCodes = element.billingInfo[0].sfxNos.split(",");
            if (element.billingInfo[0].billingLevel === 'SFX') {
              let sfxCodes = element.billingInfo[0].sfxNos.split(",");
              sfxCodes.forEach(sfxCode => {
                this.bilngLvlAndBilngCode = [...this.bilngLvlAndBilngCode, { billingLvl: "SFX", billingLvlCode: sfxCode, custMsaCode: element.propelMSACode }];
              });

            }
            let offerings = element.offerings;
            if(offerings.length >0 && element.billingInfo[0].billingLevel === 'RATE CARD'){
              offerings.forEach(eachOffering => {
                let rateCards =  eachOffering.rateCard;
                rateCards.forEach(rateCard => {
                    this.bilngLvlAndBilngCode = [...this.bilngLvlAndBilngCode, { billingLvl: "RATE CARD", billingLvlCode: rateCard.rateCardCode,custMsaCode : element.propelMSACode }];

                });
              });
            }

            billingConfigs.forEach(billData => {
              this.billingLevelValues.push(billData.entity);
              const billingByOptionsData = billData.billingByOptions;
              billingByOptionsData.forEach(eachOption => {
                this.customersBillBranch.push({
                  customerCode: element.propelMSACode,
                  billbranch: eachOption.blngBr,
                  billBranchId: eachOption.blngBrId,
                  billToAddress: eachOption.billToAddress,
                  colBr: eachOption.colBr,
                  colBrId: eachOption.colBrId,
                  submsnBr: eachOption.submsnBr,
                  submsnBrId: eachOption.submsnBrId,
                  pymtTermId: billData.pymtTermId,
                  pymtTermName: billData.billingCycle,
                  contractExpiryDate: element.contractExpiryDate,
                  altCollBr: "",
                  altCollBrId: 0,
                  billCtgy: "",
                  billToCustName: billData.aliasName,
                  billType: "",
                  blngCycle: billData.billingCycle,
                  custMsaId: element.msaId,
                  gstNumber: eachOption.gstin,
                  placeOfSupply: "",
                  stateCode: eachOption.stateCode,
                  billingLevel : element.billingInfo[0].billingLevel,
                  billingLevelCode : billData.entity,
                  bkgBr : eachOption.bkgBr,
                  bkgBrId : 0,
                  billToAddrId : (eachOption.billToAddrressDtls[0]) ? eachOption.billToAddrressDtls[0].id : "",
                  billToAddrLine1 : (eachOption.billToAddrressDtls[0]) ? eachOption.billToAddrressDtls[0].addr1 : "",
                  billToAddrLine2 : (eachOption.billToAddrressDtls[0]) ? eachOption.billToAddrressDtls[0].addr2 : "",
                  billToAddrLine3 : (eachOption.billToAddrressDtls[0]) ? eachOption.billToAddrressDtls[0].addr3 : "",
                  billToLocation : "",
                  billToPincode : (eachOption.billToAddrressDtls[0]) ? eachOption.billToAddrressDtls[0].pincode : ""
                  , ebillFlag : (billData.eBillFlag === 1) ? 'Y' : 'N',
                  ebillEmail : eachOption.ebillEmail,
                  rateCardId : (element.billingInfo[0].billingLevel == "RATE CARD") ? billData.entityID : 0,
                  rateCardCode :  (element.billingInfo[0].billingLevel == "RATE CARD") ? billData.entity : "",
                  sfxCode: (element.billingInfo[0].billingLevel == "RATE CARD") ?  element.sfxCode :"",
                  sfxId: (element.billingInfo[0].billingLevel == "RATE CARD") ? element.sfxId: 0,
                });
              });

            });
            this.wmsBillingSave.contractEndDate = element.contractExpiryDate;

          });

          this.updateBranch(this.createFormGroup.get('billLevelFc').value,null);
          this._spinner.hide();

          this.billingLevelList = [];
          console.log("before");
          console.log(this.billingLevelsData);
          console.log("after");
          const temp = this.originalBillingLevelList;
          temp.forEach(element => {
            if(this.billingLevelsData.includes(element.billingLevelName) && element.billingLevelName!='MSA'){
              this.billingLevelList = [...this.billingLevelList, { billingLevelId: element.billingLevelId, billingLevelName: element.billingLevelName }];

            }

          });
          console.log(this.billingLevelList);

        }, error => {
          this._spinner.hide();
           if (error.error != null) {
            if (error.error.errorCode === 'handled_exception') {
              this._toastr.warning((error.error.errorMessage));
            } else {
              this._toastr.error(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
            }
          } else {
            this._toastr.error(error.message);
          }
        }
      );

  }

  refresh() {
    this._cd.detectChanges();
  }

  public getOptionText(customer) {
    return (customer != null) ? customer.msaName : "";
  }

  public getOptionBrnch(billBranch) {
    return (billBranch != null) ? billBranch.billbranch : "";
  }
  public updateBranch(billingLevelCode,billingLvlValue) {
    this.branchList = [];
    console.log('Before hhh'+billingLevelCode);
    console.log(this.customersBillBranch);
    this.createFormGroup.controls.billBranchFc.setValue("");
    this.customersBillBranch.forEach(branchData => {
      if (billingLvlValue == branchData.billingLevelCode && billingLevelCode != undefined && branchData.billingLevel === billingLevelCode && branchData.customerCode === this.selectedCustCode) {
        let tempBranch : BillBranch = {
          billbranch : branchData.billbranch,
          billBranchId : branchData.billBranchId
        };
        console.log("bbbb");
        console.log(tempBranch);
        
        console.log("cccc");
        console.log(this.branchList);
        console.log("status = "+this.branchList.indexOf(tempBranch));
        if(!this.branchList.includes(tempBranch))
        {
          this.branchList.push({
            billbranch: branchData.billbranch,
            billBranchId: branchData.billBranchId
          });
        }

        console.log(this.branchList);
      }
    });

    this.branchList  = this.branchList.filter((v) => !this.branchList.indexOf(v));
    console.log(this.branchList);
  }

  public selectBillingLevel(billingLevel) {
    this.bilngLvlAndBilngCodeList = [];
    console.log(billingLevel);
    this.createFormGroup.controls.billLevelCodeFc.setValue("");
    this.bilngLvlAndBilngCode.forEach(data => {
      if (billingLevel != undefined && data.billingLvl === billingLevel.billingLevelName && data.custMsaCode === this.selectedCustCode) {
        this.bilngLvlAndBilngCodeList = [...this.bilngLvlAndBilngCodeList, { billingLvl: data.billingLvl, billingLvlCode: data.billingLvlCode,custMsaCode : data.custMsaCode }];

      }
    });
    if (billingLevel != undefined) {
      this.selectedBillingLvl = billingLevel.billingLevelName; 
      this.updateBranch(billingLevel.billingLevelName,null);
      this.selectedBillingLevelId = billingLevel.billingLevelId;
    }

  }

  public setCustomerBillBranch(branchData) {
    console.log(branchData);
    let billlevel1 = this.createFormGroup.get('billLevelFc').value;
    let billlevelcode1 = this.createFormGroup.get('billLevelCodeFc').value;

    this.customerBillBranch.altCollBrId = branchData.altCollBrId;
    this.customerBillBranch.billbranch = branchData.billbranch;
    this.customerBillBranch.billBranchId = branchData.billBranchId;
    this.customerBillBranch.customerCode = branchData.customerCode;
    this.customerBillBranch.billToAddress = branchData.billToAddress;
    this.customerBillBranch.colBr = branchData.colBr;
    this.customerBillBranch.colBrId = branchData.colBrId;
    this.customerBillBranch.submsnBr = branchData.submsnBr;
    this.customerBillBranch.submsnBrId = branchData.submsnBrId;
    this.customerBillBranch.pymtTermId = branchData.pymtTermId;
    this.customerBillBranch.pymtTermName = branchData.pymtTermName;
    this.customerBillBranch.contractExpiryDate = branchData.contractExpiryDate;
    this.customerBillBranch.altCollBr = branchData.altCollBr;
    this.customerBillBranch.altCollBrId = branchData.altCollBrId;
    this.customerBillBranch.billCtgy = branchData.billCtgy;
    this.customerBillBranch.billToCustName = branchData.billToCustName;
    this.customerBillBranch.billType = branchData.billType;
    this.customerBillBranch.blngCycle = branchData.blngCycle;
    this.customerBillBranch.custMsaId = branchData.custMsaId;
    this.customerBillBranch.gstNumber = branchData.gstNumber;
    this.customerBillBranch.placeOfSupply = branchData.placeOfSupply;
    this.customerBillBranch.sfxCode = branchData.sfxCode;
    this.customerBillBranch.sfxId = branchData.sfxId;
    this.customerBillBranch.stateCode = branchData.stateCode;
    this.customerBillBranch.billingLevel = billlevel1;
    this.customerBillBranch.billingLevelCode = billlevelcode1;
    this.customerBillBranch.billToAddrId = branchData.billToAddrId;
    this.customerBillBranch.billToAddrLine1 = branchData.billToAddrLine1;
    this.customerBillBranch.billToAddrLine2 = branchData.billToAddrLine2;
    this.customerBillBranch.billToAddrLine3 = branchData.billToAddrLine3;
    this.customerBillBranch.billToLocation = branchData.billToLocation;
    this.customerBillBranch.billToPincode = branchData.billToPincode;
    this.customerBillBranch.ebillFlag = branchData.ebillFlag;
    this.customerBillBranch.ebillEmail = branchData.ebillEmail;
    this.customerBillBranch.rateCardId = branchData.rateCardId;
    this.customerBillBranch.rateCardCode = branchData.rateCardCode;

  }

  ngDoCheck(){}

    /*customerSearch() {
      //if (this.customerList.length > 0 ) {
        const dialogRef = this._dialog.open(CustomerSearchComponent, {data: this.customerList, disableClose: true });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result[0] != null) {
              console.log(result[0]);
              this.createFormGroup.controls.customerFc.setValue("   "+result[0].custName);
              this.selectedCustCode = result[0].custMsaCode.trim();
              this.selectedMsaId = result[0].custMsaId;
              this.createFormGroup.controls.billBranchFc.setValue('');

              const temp = this.originalBillingLevelList;
              this.billingLevelList = [];
              temp.forEach(element => {
                if(element.billingLevelName === result[0].billingLevel){
                  this.billingLevelList = [...this.billingLevelList, { billingLevelId: element.billingLevelId, billingLevelName: element.billingLevelName }];

                }

              });
              console.log(this.billingLevelList);

            }

          }
        });
      //}
    }
    */
    branchSearch() {
      //if (this.customerList.length > 0 ) {
        const dialogRef = this._dialog.open(BranchSearchComponent, {data: this.branchList, disableClose: true });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.hideSearchResult();
            if (result[0] != null) {
              this.createFormGroup.controls.billBranchFc.setValue("   "+result[0].billbranch);
              this.selectedBranchId = result[0].billBranchId;
              }

          }
        });
      //}
    }


    getSavedDataStatus(isSaved : string){
      //this.isDataSaved = isSaved;
      if(isSaved === 'saved'){
        this.displayResultComponent = false;
        this.createFormGroup.reset();
      }

    }

    customerSearch(){
      const dialogRef = this._dialog.open(CustomerSearchDialogComponent,{ width: '550px'});
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result[0] != null) {
                  console.log(result[0]);
                  this.hideSearchResult();
                  this.createFormGroup.controls.billLevelFc.reset();
                  this.createFormGroup.controls.billLevelCodeFc.reset();
                  this.createFormGroup.controls.billBranchFc.reset();
                  
                  //this.custTypeLookUp(result[0].propelMsaCode,result[0].aliasName);
                  this.loadCustomerData(result[0].propelMsaCode,result[0].aliasName);

                  this.createFormGroup.controls.customerFc.setValue("   "+result[0].msaName);
                  this.selectedCustCode = result[0].propelMsaCode.trim();

                  this.createFormGroup.controls.billBranchFc.setValue('');

                }
            }
          });
    }


  // cust Type LookUp API
  custTypeLookUp(msaCode:string,accountType : string) {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('CUST_TYPE').subscribe(
      response => {
        //this._spinner.hide();
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === accountType) {
              this.customerContract.type = lkps.id;
            }
          });
          this.loadCustomerData(msaCode,accountType);

      },
      error => {
        this._spinner.hide();
        if (error.error != null && error.error.errorMessage != null) {
          this._toastr.warning(error.error.errorMessage);
        } else {
          this._toastr.warning(error.message);
        }
      });
  }

   // Service Line LookUp API
   serviceLineLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('SERVICE_LINE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            if (lkps.lookupVal === 'WAREHOUSE') {
              this.customerContract.serviceLine = lkps.id;
            }
          });
      },
      error => {
        this._spinner.hide();
        if (error.error != null && error.error.errorMessage != null) {
          this._toastr.warning(error.error.errorMessage);
        } else {
          this._toastr.warning(error.message);
        }
      });
  }

  hideSearchResult(){
    this.displayResultComponent = false;
  }

  selectBillingLvlValue(billingLvlValue){
    this.updateBranch(this.selectedBillingLvl,billingLvlValue.billingLvlCode);
  }
}
