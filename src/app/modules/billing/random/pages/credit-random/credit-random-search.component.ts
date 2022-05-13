import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { RandomCreditCustomerDetails } from '../../models/random-creditcust.model';
import { RandomCustRequest } from '../../models/random-customer-request.model';
import { RandomSearchParam } from '../../models/random-waybill-search-request.model';
import { RandomBillingService } from '../../services/random-billing.service';
import { BranchesDailogComponent } from './branches-dailog/branches-dailog.component';


interface BillingLevelList {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-credit-random-search',
  templateUrl: './credit-random-search.component.html',
  styleUrls: ['./credit-random-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class CreditRandomSearchComponent implements OnInit {

  createFormGroup: FormGroup;
  blngLvlList: BillingLevelList[] = [];
  todayDt: Date = new Date();
  showResult = false;
  randomSearchParam: RandomSearchParam = {} as RandomSearchParam;
  isPRC = false;
  selectedBillType: string;
  creditCustDetails: RandomCreditCustomerDetails[] = [];
  rateCardBranchIds = [];
  serviceOfferingId: number;
  fromDate: string;
  toDate: string;

  rateCardCode: string;
  rateCardid: number;
  billingCycleId: number;

  // for tooltip
  billingAddress: string;

  waybillNumbers: string;

  billingOptionsID: any;

  minBillingDate: Date;

  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _randomBillingService: RandomBillingService) { }

  ngOnInit() {
    this.initForm();
    this.blngLevelLookup();
  }

  selectBillType(billType) {
    this.selectedBillType = billType.viewValue;
    console.log(this.selectedBillType);
  }


  initForm() {
    this.createFormGroup = new FormGroup({
      billingLevelFC: new FormControl('', [Validators.required]),
      billingLevelValFC: new FormControl('', [Validators.required]),
      submissionBranchFC: new FormControl('', [Validators.required]),
      collectionBranchFC: new FormControl('', [Validators.required]),
      billingBranchFC: new FormControl('', [Validators.required]),
      billDateFC: new FormControl('', [Validators.required]),
      billFromDateFC: new FormControl(''),
      billToDateFC: new FormControl(''),
      billingAddressFC: new FormControl(''),
      gstinFC: new FormControl(''),
      waybillNumbersFC: new FormControl('')
    });
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


  // billing level look up
  blngLevelLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.blngLvlList = [...this.blngLvlList, { value: lkps.id, viewValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // // cust Type LookUp API
  // getBillingCycleId() {
  //   this._lookupService.getLookupValuesByType('BILLING_CYCLE').subscribe(
  //     response => {
  //       response.data.forEach(
  //         lkps => {
  //           if (lkps.lookupVal === 'RANDOM') {
  //             this.billingCycleId = lkps.id;
  //           }
  //         });
  //     },
  //     error => {
  //       this.handleError(error);
  //     });
  // }

 getCustByBillingLevel() {
    this.rateCardBranchIds = [];
    this.creditCustDetails = [];
    let request: RandomCustRequest = {} as RandomCustRequest;
    // request
    request.autoBillFlag = 'N';
    request.billingCycle = 'ALL';
    request.randomFlag = 'Y';
    request.type = 'CREDIT';
    request.billingLevel = this.createFormGroup.get('billingLevelFC').value.value;

    if (request.billingLevel == null) {
      this._toastr.error("Please Select Billing Level");
      return false;
    }

    let billingLevelValue = this.createFormGroup.get('billingLevelValFC').value.trim().toUpperCase();

    if(billingLevelValue == null || billingLevelValue.length == 0) {
      this._toastr.error("Please Enter Billing Level Code");
      return false;
    }
    if (billingLevelValue.length > 3) {
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'MSA' && billingLevelValue.substr(0, 3).toUpperCase() !== 'MSA') {
        this._toastr.error("MSA level value must start with MSA");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        this.clearSearch();
        return false;
      }
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'SFX' && billingLevelValue.substr(0, 3).toUpperCase() !== 'SFX') {
        this._toastr.error("SFX level value must start with SFX");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        this.clearSearch();
        return false;
      }
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'RATE CARD' && billingLevelValue.substr(0, 2).toUpperCase() !== 'RC') {
        this._toastr.error("Rate Card level value must start with RC");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        this.clearSearch();
        return false;
      }

      // billing level value
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'MSA') {
        request.msaCode = billingLevelValue;
      } else if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'SFX') {
        request.sfxCode = billingLevelValue;
      } else {
        request.rateCardCode = billingLevelValue;
      }
      if (request) {
        this.getCustomerData(request, billingLevelValue);
      }
    }
  }

  getCustomerData(request: RandomCustRequest, billingLevelValue: string) {
    this._spinner.show();
    this._randomBillingService.postGetCustByBillingLvl(request).subscribe(
      response => {
        this._spinner.hide();
        console.log(response);
        if (response.data != null) {
          this.contactDataValidation(request, response, billingLevelValue);
        } else {
          this._spinner.hide();
          if (response.errors.error != null && response.errors.error.length > 0) {
            this._toastr.error(response.errors.error[0].code + " " + response.message + ' Details: ' + response.errors.error[0].description);
          } else {
            this._toastr.error(response);
          }
        }
      },
      error => {
        this._spinner.hide();
        console.log(error);
        if (error.error.errorCode != null) {
          this._toastr.error(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.error(error.message);
        }
      });
  }


  // contract customer data validation
  contactDataValidation(request: RandomCustRequest, response: any, billingLevelValue: string) {
    console.log(response);
    let custData = response.data.custContResp;
    if (response.data.custContResp.length > 0) {
      console.log("custData", custData);
      let offeringData = custData[0].offerings;
      console.log('offering ', offeringData);
      console.log('Before offering ');

      // to get assign branches from customer contract response
      offeringData.forEach(offering => {
        let rateCard = offering.rateCard;
        this.serviceOfferingId = offering.serviceOfferingId;
        console.log('Before rateCard ');
        rateCard.forEach(rateCard => {
          let assignBranch = rateCard.assignBranch;
          this.rateCardCode = rateCard.rateCardCode;
          this.rateCardid = rateCard.id;
          console.log('Before assignBranch ');
          assignBranch.forEach(assignBranch => {
            this.rateCardBranchIds.push(assignBranch.brId);
          });
        });
      });
      console.log('After offering ');

      let billingInfo = custData[0].billingInfo;

      if (billingInfo.length > 0) {
        console.log("Before billingInfo");

        billingInfo.forEach(element => {

          let billingConfigs = element.billingConfigs;

          if (billingConfigs.length == 0) {
            this._toastr.warning('Customer Billing SubType is not RANDOM for this Contact');
            this.clearSearch();
            return false;
          }

          console.log("reuest billing level", request.billingLevel);

          if (element.billingLevelId === request.billingLevel) {
            console.log("inside same billing level");

            billingConfigs.forEach(billcongfig => {
              let billOptions = billcongfig.billingByOptions;
              console.log("billOptions", billOptions);
              const optionGrpMap = this.groupBy(billOptions, opt => opt.blngBr);
              billOptions.forEach(billOption => {
                // set from and to date on UI
                if(null != billOption.lastBillingDate && billOption.lastBillingDate != '') {
                  this.minBillingDate = new Date(billOption.lastBillingDate);
                } 
                else {
                  const currDate = new Date();
                  this.minBillingDate = new Date(currDate.getFullYear(), currDate.getMonth() - 1, 0);
                }
                this.setBillingFromAndToDates(billOption.lastBillingDate ,billcongfig.billingCycle);
                console.log("billOptions", billOption);
                console.log("billOptions billToAddrressDtls", billOption.billToAddrressDtls);
                console.log("billOptions Grouped BKG BRS", optionGrpMap.get(billOption.blngBr));
                this.creditCustDetails.push({
                  billingLevel: element.billingLevel,
                  billingLevelValue: this.createFormGroup.get('billingLevelValFC').value.trim().toUpperCase(),
                  billingLevelId: element.billingLevelId,
                  msaCode: element.msa,
                  sfxId: element.sfxIds,
                  sfxCode: element.sfxNos,

                  // billing config
                  billingCycleId: billcongfig.billingCycleId,
                  billingCycle: billcongfig.billingCycle,

                  billingConfigId: billcongfig.billingConfigId,
                  pymtTermName: billcongfig.pymtTermName,
                  eBillFlag: billcongfig.eBillFlag,
                 // gstNum: billcongfig.gstin,
                  gstinRegdFlag: billcongfig.gstinRegdFlag,
                  aliasName: billcongfig.aliasName,
                  autoBillFlag: billcongfig.autoBillFlag,
                  subTypeId: billcongfig.subTypeId,
                  subType: billcongfig.subType,
                  subTypeValue: billcongfig.subTypeValue,

                  serviceOfferingId: this.serviceOfferingId,
                  rateCardId: this.rateCardid,
                  rateCardCode: this.rateCardCode,
                  branchIds: this.rateCardBranchIds,
                  assgnbranchIds: optionGrpMap.get(billOption.blngBr),
                  billingFromDate: this.convert(this.createFormGroup.get('billFromDateFC').value),
                  billingEndDate: this.convert(this.createFormGroup.get('billToDateFC').value),

                  businessType: custData[0].businessType,
                  businessTypeId: custData[0].businessTypeId,
                  msaName: custData[0].custName,
                  msaId: custData[0].msaId,

                  billingByLevel: billOption.billingByLevel,
                  billingByLevelId: billOption.billingByLevelId,
                  billingByOptionId: billOption.billingByOptionId,

                  blngBr: billOption.blngBr,
                  blngBrId: billOption.blngBrId,
                  collBr: billOption.colBr,
                  collBrId: billOption.colBrId,
                  submsnBr: billOption.submsnBr,
                  submsnBrId: billOption.submsnBrId,
                  gstNum: billOption.gstin,


                  email: billOption.ebillEmail,
                  minBlngAmt: billOption.minBlngAmt,

                  // address from contract
                  billToAddr: billOption.billToAddress,
                  billToAddrId: (billOption.billToAddrressDtls.length > 0) ? billOption.billToAddrressDtls[0].id : 0,
                  billToAddrLine1: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].addr1) ? billOption.billToAddrressDtls[0].addr1 : null) : null,
                  billToAddrLine2: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].addr2) ? billOption.billToAddrressDtls[0].addr2 : null) : null,
                  billToAddrLine3: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].addr3) ? billOption.billToAddrressDtls[0].addr3 : null) : null,
                  billToLocation: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].city) ? billOption.billToAddrressDtls[0].city : null) : null,
                  billToPincode: (billOption.billToAddrressDtls.length > 0) ? billOption.billToAddrressDtls[0].pincode : 0,
                  billToCity: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].city) ? billOption.billToAddrressDtls[0].city : null) : null,
                  billToState: (billOption.billToAddrressDtls.length > 0) ? ((billOption.billToAddrressDtls[0].state) ? billOption.billToAddrressDtls[0].state : null) : null,


                  // waybills data
                  waybillsData: null
                });
               // this.createFormGroup.controls.gstinFC.setValue(billcongfig.gstNum);

               this.createFormGroup.controls.gstinFC.setValue(billOption.gstin);
                if (billOption.billToAddrressDtls.length == 0) {
                  this._toastr.error("Bill to Address is Empty in the contract");
                  this.clearSearch();
                } else {
                  this.createFormGroup.controls.billingAddressFC.setValue(billOption.billToAddress);
                  this.billingAddress = billOption.billToAddress;
                }
              });
            });
          } else {
            this._toastr.error("Billing level is different than selected. Please select correct billing level : " + element.billingLevel);
            this.clearSearch();
          }
        });
      }
    } else {
      this._toastr.error("No Data Found for Customer : " + billingLevelValue);
      this.clearSearch();
    }
  }

  //groupingFuction
  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item.bkgBrId]);
         } else {
             collection.push(item.bkgBrId);
         }
    });
    return map;
}

  // from date and to date based on last billdate
  setBillingFromAndToDates(lastBillingDate: string,billingCycle: string) {

       // add one day to last bill date incase of
       let billfrom = new Date(lastBillingDate);

       if(lastBillingDate === '') {
         const currDate = new Date();
         billfrom = new Date(currDate.getFullYear(), currDate.getMonth() - 1, 0);
       }
       billfrom.setDate(billfrom.getDate()+1);

       this.createFormGroup.controls.billFromDateFC.setValue(billfrom);

    if("EVERY 30 DAYS" === billingCycle) {

     // last day of the month
     let lastDate = new Date(billfrom.getFullYear(), billfrom.getMonth() + 1, 0);

    // set bill date ,from and to date based on billing level
     this.createFormGroup.controls.billToDateFC.setValue(lastDate);
     this.createFormGroup.controls.billDateFC.setValue(lastDate);

    } else if("EVERY 15 DAYS" === billingCycle) {

      let tempDate;
      if(billfrom.getDay() >= 16) {
        tempDate = new Date(billfrom.getFullYear(), billfrom.getMonth() + 1, 0);
      } else {
        // 15th date of from date
        tempDate = new Date(billfrom.getFullYear(), billfrom.getMonth(), 15);
      }
      // set bill date , end date based on billing level
     this.createFormGroup.controls.billToDateFC.setValue(tempDate);
     this.createFormGroup.controls.billDateFC.setValue(tempDate);

    } else if("RANDOM"=== billingCycle) {
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate()-1);

      // set bill date , end date based on billing level
      this.createFormGroup.controls.billToDateFC.setValue(currentDate);
      this.createFormGroup.controls.billDateFC.setValue(currentDate);
    }


    // this.createFormGroup.controls.billDateFC.setValue(new Date());
    // if (lastBillingDate != "" || lastBillingDate != null) {
    //   let billfrom = this.convert(lastBillingDate+1);

    //   this.createFormGroup.controls.billFromDateFC.setValue(billfrom);
    //   this.createFormGroup.controls.billToDateFC.setValue(new Date());
    // } else {

    //   // if last bill date is null from contract
    //   var lastMonthLastDate = new Date();
    //   lastMonthLastDate.setDate(0); // 0 will result in the last day of the previous month
    //   lastMonthLastDate.setMonth(lastMonthLastDate.getMonth()-1);


    //   this.createFormGroup.controls.billFromDateFC.setValue(this.convert(billingStartDate));
    //   this.createFormGroup.controls.billToDateFC.setValue(new Date());
    // }
  }

  // collection branch
  openCollBranchesDialog() {
    const dialogRef = this._dialog.open(BranchesDailogComponent, {
      data: {
        dataKey: this.creditCustDetails,
        openFrom: "collBranch"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          console.log(result);
          this.creditCustDetails[0].collBr = result[0].branchName;
          this.createFormGroup.controls.collectionBranchFC.setValue(result[0].branchName);

        }
      }
    }
    );
  }

  // submission branch
  openSubMsnBranchesDialog() {
    console.log('opening');
    const dialogRef = this._dialog.open(BranchesDailogComponent, {
      data: {
        dataKey: this.creditCustDetails,
        openFrom: "submsnBranch"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          console.log(result);
          // this.alliedBill.submissionBranchId = result[0].branchId;
          this.creditCustDetails[0].submsnBr = result[0].branchName;
          this.createFormGroup.controls.submissionBranchFC.setValue(result[0].branchName);

        }
      }
    }
    );
  }

  // Billing Branch
  openBlngBranchesDialog() {
    console.log('this.creditCustDetails',this.creditCustDetails[0].blngBrId);
    const dialogRef = this._dialog.open(BranchesDailogComponent, {
      data: {
        dataKey: this.creditCustDetails,
        openFrom: "billBranch",
      }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          this.createFormGroup.controls.billingBranchFC.setValue(result[0].branchName);
          this.creditCustDetails.forEach(element => {
            if (element.blngBrId === result[0].branchId) {
              element.blngBr = result[0].branchName;
              console.log('Element Value: ', element.billingByOptionId);

              this.createFormGroup.controls.gstinFC.setValue(element.gstNum);
              if (element.billToAddr.length == 0) {
                this._toastr.error("Bill to Address is Empty in the contract");
                this.clearSearch();
              } else {
                this.createFormGroup.controls.billingAddressFC.setValue(element.billToAddr);
                this.billingAddress = element.billToAddr;
              }
              // this.setBillingFromAndToDates(element ,billcongfig.billingCycle);
              this.createFormGroup.controls.billFromDateFC.setValue(element.billingFromDate);
              this.createFormGroup.controls.billToDateFC.setValue(element.billingEndDate);
              this.createFormGroup.controls.billDateFC.setValue(element.billingEndDate);

              this.billingOptionsID = element.billingByOptionId;
              this._randomBillingService.selectedBillingOptionsID = this.billingOptionsID;
              // set submission branch
              this.setSubmissionBranch(element.submsnBrId);
    
              // set collection branch
              this.setCollectionBranch(element.collBrId);
            }
          });

      }
      }
    }
    );
  }

  // errors function
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


  search() {
    const newRandomSearchParam = {} as RandomSearchParam;
    newRandomSearchParam.billingFromDate = this.convert(this.createFormGroup.get('billFromDateFC').value);
    newRandomSearchParam.billingEndDate = this.convert(this.createFormGroup.get('billToDateFC').value);
    newRandomSearchParam.billingLevel = this.createFormGroup.get('billingLevelFC').value.viewValue === "RATE CARD" ? 'RC':this.createFormGroup.get('billingLevelFC').value.viewValue;
    newRandomSearchParam.billingLevelValue = this.creditCustDetails[0].billingLevelValue;
    newRandomSearchParam.billingLevelId = Number(this.creditCustDetails[0].billingLevelId);
    newRandomSearchParam.billingBylevelId = Number(this.creditCustDetails[0].billingByLevelId);
    newRandomSearchParam.msaCode = this.creditCustDetails[0].msaCode;
    newRandomSearchParam.msaId = this.creditCustDetails[0].msaId;
    newRandomSearchParam.batchDetailId = 0;
    newRandomSearchParam.batchId = 0;
    newRandomSearchParam.customerContracts = [Number(this.creditCustDetails[0].sfxId)];
    newRandomSearchParam.billingCycleId = this.creditCustDetails[0].billingCycleId;
    newRandomSearchParam.businessTypeId = this.creditCustDetails[0].businessTypeId;
    newRandomSearchParam.branchIds = this.getBranchIdForWayBillSearch(this.creditCustDetails);
    console.log('Returned Branch IDs', newRandomSearchParam.branchIds);
    this.randomSearchParam = newRandomSearchParam;
    this.waybillNumbers = this.createFormGroup.get('waybillNumbersFC').value;
    this.fromDate = this.convert(this.createFormGroup.get('billFromDateFC').value);
    this.toDate = this.convert(this.createFormGroup.get('billToDateFC').value);
    this.showResult = true;
  }



  reset() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed with page refresh?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearSearch();
      }
    });
  }

  clearSearch() {
    this.creditCustDetails = [];
    this.randomSearchParam = {} as RandomSearchParam;
    this.createFormGroup.reset();
    this.showResult = false;
  }

  // called from child result component.
  resetComponent(clear) {
    console.log(clear);
    if (clear) {
      this.clearSearch();
    }
  }

  // to assign branch id based on billingByLevel
  getBranchIdForWayBillSearch(creditCustDetails: RandomCreditCustomerDetails[]): any {

    console.log('Before LOOP: billing Option ID: ', this.billingOptionsID);
    let creditCustomerDetail : RandomCreditCustomerDetails[] = null;
    creditCustomerDetail = creditCustDetails.filter(element => element.billingByOptionId === this.billingOptionsID);
    // creditCustDetails.forEach(element => {
    //   console.log('Inside LOOP: element billing Option ID: ', element.billingByOptionId);
    //   if(element.billingByOptionId === this.billingOptionsID) {

    //     console.log('Inside IF: element billing Option ID: ', element.billingByOptionId);
    //     if ('DESTINATION STATE WISE' === element.billingByLevel
    //       || 'DESTINATION BRANCH WISE' === element.billingByLevel) {

    //       return [element.blngBrId];
    //     } else if ("CONSOLIDATION" === element.billingByLevel) {

    //       return this.rateCardBranchIds;
    //     } else {

    //       // booking branch
    //       console.log('Inside IF: Element Assigned Branch ID: ', element.assgnbranchIds);
    //       return element.assgnbranchIds;
    //     }
    //   }
    // })
    if ('DESTINATION STATE WISE' === creditCustomerDetail[0].billingByLevel
        || 'DESTINATION BRANCH WISE' === creditCustomerDetail[0].billingByLevel) {
  
            return [creditCustomerDetail[0].blngBrId];
          } else if ("CONSOLIDATION" === creditCustomerDetail[0].billingByLevel) {
  
            return this.rateCardBranchIds;
          } else {
            // booking branch
            return creditCustomerDetail[0].assgnbranchIds;
          }

  }

  // submission branch
  setSubmissionBranch(branchId: number) {
    this.callBranchApiBySubBranchId(branchId);
  }

  // collection branch
  setCollectionBranch(branchId: number) {
    this.callBranchApiByCollBranchId(branchId);
  }

  callBranchApiBySubBranchId(branchId: number) {
      this._randomBillingService.getBranchDetailsByBranchId(branchId).subscribe(
        response => {
          let dataResponse = response['data'];
          this.createFormGroup.controls.submissionBranchFC.setValue(dataResponse.branchName);
        },
        error => {
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
  }

  callBranchApiByCollBranchId(branchId: number) {

      this._spinner.show();
      this._randomBillingService.getBranchDetailsByBranchId(branchId).subscribe(
        response => {
          this._spinner.hide();
          let dataResponse = response['data'];

          this.createFormGroup.controls.collectionBranchFC.setValue(dataResponse.branchName);

        },
        error => {
          this._spinner.hide();
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
  }

  myFilter = (d: Date | null): boolean => {
    const date = (d || new Date());
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    console.log('Days in selected month: ', daysInMonth);
    if(null != this.creditCustDetails && this.creditCustDetails.length != 0) {
      if(this.creditCustDetails[0].billingCycle == 'EVERY 30 DAYS') {
        return date.getDate() == 1;
      }
      if(this.creditCustDetails[0].billingCycle == 'EVERY 15 DAYS') {
        return date.getDate() == 1 || date.getDate() == 16;
      }
    }
    return date.getDate() <= daysInMonth;
  }

  updateBillDates(billFromDateFC: any) {
    console.log('Parameter: ', billFromDateFC.value);
    let fromDate = new Date(billFromDateFC.value);
    fromDate.setDate(fromDate.getDate()-1);
    const billingCycle = this.creditCustDetails[0].billingCycle;
    this.setBillingFromAndToDates(fromDate != null ? fromDate.toISOString() : null, billingCycle);
  }

}
