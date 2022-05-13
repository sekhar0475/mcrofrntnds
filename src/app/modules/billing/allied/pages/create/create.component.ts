import { BillDetailResponseDto } from './../../models/bill-detail-response-dto.model';
import { AlliedBillingService } from './../../services/allied-billing.service';
import { AlliedBill } from './../../models/allied-bill.model';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BranchDialogComponent } from '../branch-dialog/branch-dialog.component';
import { MatDialog, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { WaybillRequest } from '../../models/waybill-request.model';
import { BillingLevelRequest } from '../../models/billing-level-request.model';
import { CreditCustomerDetails } from '../../models/credit-customer-details.model';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';


interface BillTypeList {
  value: string;
  viewValue: string;
}
interface PaidOrTopayList {
  value: string;
  viewValue: string;
}
interface AlliedBillLevelsList {
  value: string;
  viewValue: string;
}

interface BillingLevelList {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class CreateComponent implements OnInit {
  createFormGroup: FormGroup;
  isDocNumValid: boolean = false;
  isHeadValid: boolean = false;
  isPRC: boolean = true;
  alreadyExistsWaybillNumbers: string;
  billBranchIdPrc: String[] = [];
  rb: string;
  billDetails: BillDetailResponseDto[] = [];
  prcNonPrcList: string[] = ['PRC', 'NONPRC', 'EXTRA'];
  billTypeList: BillTypeList[] = [];
  alliedBillLevelsList: AlliedBillLevelsList[] = [];
  paidOrToPaylist: PaidOrTopayList[] = [];
  billingLevelList: BillingLevelList[] = [];
  alliedBill: AlliedBill = {} as AlliedBill;
  selectedAlliedBillLevel: number;
  selectedBillType: number;
  isNext: boolean = true;
  toDateValue: Date;
  isWaybillValid: boolean = true;
  @ViewChild('myForm', { static: false }) myForm: NgForm;
  creditCustDetails: CreditCustomerDetails[] = [];
  paidTopay: string[];
  todayDt: Date = new Date();
  documentNumber: string;
  billSearched: boolean = false;
  submissionTrue: boolean = false;
  collectionTrue: boolean = false;
  constructor(private _alliedservice: AlliedBillingService,
    private _toastr: ToastrService,
    private dialog: MatDialog,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _cd: ChangeDetectorRef,
    private _activatedRouter: ActivatedRoute) { }

  ngOnInit() {
    this.billTypeList = [{ value: '1', viewValue: 'CREDIT' }, { value: '2', viewValue: 'RETAIL' }];
    this.alliedBillLevelsList = [{ value: '1', viewValue: 'BILL' },
    { value: '2', viewValue: 'WAYBILL' },
    { value: '3', viewValue: 'STANDALONE' }];
    this.initForm();
    this.setAlliedBillType();

    if(this.createFormGroup.get('billtypeFC').value == 'RETAIL') {
      this.updateFormValiditiesForPincodeAndPaidToPay();
    }

  }

  initForm() {
    this.blngLevelLookup();
    this.paidToPayLookup();
    this.createFormGroup = new FormGroup({
      billtypeFC: new FormControl('', [Validators.required]),
      alliedBillLevelFC: new FormControl('', [Validators.required]),
      docNumFC: new FormControl(''),
      billingLevelFC: new FormControl(''),
      billingLevelValFC: new FormControl(''),
      billingBranchFC: new FormControl('',[Validators.required]),
      billingAddressFC: new FormControl('', [Validators.minLength(4),Validators.required]),
      wbFC: new FormControl('',[Validators.required]),
      insmtRefDtFC: new FormControl(''),
      submissionBranchFC: new FormControl('',[Validators.required]),
      collectionBranchFC: new FormControl('',[Validators.required]),
      gstinFC: new FormControl(''),
      billDateFC: new FormControl(new Date(), [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),
      matRadioFc: new FormControl(''),
      prcIdFc: new FormControl(''),
      custNameFC: new FormControl(''),
      pincodeFC: new FormControl('', [Validators.min(6)]),
      paidOrTopayFC: new FormControl('')
    });
  }
  oneMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    new Date().getDate()
  );
  // billing level look up
  blngLevelLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('BILLING_LEVEL').subscribe(
      response => {
        console.log(response);
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.billingLevelList = [...this.billingLevelList, { value: lkps.id, viewValue: lkps.lookupVal }];
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
  setAlliedLevel(level) {
    if (level.viewValue != null) {
      // call customer service
      this.alliedBillLevelsList = [];
      /*this._receiptService.getCustomer(customer.viewValue).subscribe(
        response => {
          this.customerList = response;
        },
        error => {
          this.handleError(error);
        }
      );*/
    }
  }
  openCollBranchesDialog() {
    if (this.isNext) {
      const dialogRef = this.dialog.open(BranchDialogComponent, {
        data: {
          dataKey: this.creditCustDetails,
          openFrom: "collBranch",
          billType: this.selectedBillType,
          isPrc: this.isPRC
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result[0] != null) {
            console.log(result);
            this.alliedBill.collectionBranchId = result[0].branchId;
            this.createFormGroup.controls.collectionBranchFC.setValue("    " + result[0].branchName);

          }
        }
      }
      );
    }
  }

  openSubMsnBranchesDialog() {
    if (this.isNext) {
      console.log('opening');
      const dialogRef = this.dialog.open(BranchDialogComponent, {
        data: {
          dataKey: this.creditCustDetails,
          openFrom: "submsnBranch",
          billType: this.selectedBillType,
          isPrc: this.isPRC
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result[0] != null) {
            console.log(result);
            this.alliedBill.submissionBranchId = result[0].branchId;
            this.createFormGroup.controls.submissionBranchFC.setValue("    " + result[0].branchName);

          }
        }
      }
      );
    }
  }

  openBlngBranchesDialog() {
    if (this.isNext) {
      const dialogRef = this.dialog.open(BranchDialogComponent, {
        data: {
          dataKey: this.creditCustDetails,
          openFrom: "billBranch",
          billType: this.selectedBillType,
          isPrc: this.isPRC,
          prcBranchs: this.billBranchIdPrc
        }

      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result[0] != null) {
            console.log(result);
            this.alliedBill.billingBranchId = result[0].branchId;
            this.createFormGroup.controls.billingBranchFC.setValue("    " + result[0].branchName);
            this.creditCustDetails.forEach(element => {
              if (element.blngBrId === result[0].branchId) {
                this.createFormGroup.controls.billingAddressFC.setValue(element.billToAddr);
                this.createFormGroup.controls.gstinFC.setValue(element.gstNum);
              }
            });
            // set submission branch
            this.setSubmissionBranch(this.creditCustDetails[0].submsnBrId);
           this.alliedBill.submissionBranchId = this.creditCustDetails[0].submsnBrId;

            // set collection branch
            this.setCollectionBranch(this.creditCustDetails[0].collBrId);
            this.alliedBill.collectionBranchId = this.creditCustDetails[0].collBrId;
          }
        }
      }
      );
    }
  }

  setBillingLevel(level) {
    this.billingLevelList.forEach(data => {
      if (level !== undefined && data.value === level.value) {
        this.alliedBill.billingLevelId = data.value;
        this.alliedBill.billingLevel = data.viewValue;
      }
    });
    this.clearValues();
  }

  selectAlliedBillingLevel(alLevel) {

    this.selectedAlliedBillLevel = alLevel.value;
    if (this.selectedAlliedBillLevel == 2 || this.selectedAlliedBillLevel == 3) {
      this.billSearched = true;
    } else {
      this.billSearched = false;
    }
    //this.setRequired();
    this.createFormGroup.controls.docNumFC.setValue('');
    this.createFormGroup.controls.billPeriodfromFC.setValue(null);
    this.createFormGroup.controls.billPeriodtoFC.setValue(null);
    this.createFormGroup.controls.docNumFC.setValue('');
    this.createFormGroup.controls.prcIdFc.setValue('');
    this.createFormGroup.controls.billingLevelValFC.setValue('');
    this.createFormGroup.controls.billingBranchFC.setValue('');
    this.createFormGroup.controls.billingAddressFC.setValue('');
    this.createFormGroup.controls.gstinFC.setValue('');
    this.createFormGroup.controls.submissionBranchFC.setValue('');
    this.createFormGroup.controls.collectionBranchFC.setValue('');
    this.createFormGroup.controls.billDateFC.setValue('');
    this.createFormGroup.controls.pincodeFC.setValue('');
    this.createFormGroup.controls.paidOrTopayFC.setValue('');
    this.createFormGroup.controls.billingLevelFC.setValue('');
    this.createFormGroup.controls.custNameFC.setValue('');
    this.setFormValidators();
    if(this.selectedAlliedBillLevel == 3){
      this.createFormGroup.controls.wbFC.setValue('N/A');
    }
    else {
      this.createFormGroup.controls.wbFC.setValue('');
    }
    
  }

  selectBillType(billType) {
    this.selectedBillType = billType.value;
  }

  refresh() {
    this._cd.detectChanges();
  }
  processNext() {
    let billNum: string = "";
    if (this.billDetails.length > 0) {
      billNum = String(this.billDetails[0].billNum);
    }
    this.validateWaybillNumbers(billNum);
    this.isNext = false;
    //this.alliedBill.billType = this.createFormGroup.get('billtypeFC').value.viewValue;
    this.alliedBill.billtypeId = this.selectedBillType;
    console.log("this.alliedBill.billtypeId" + this.alliedBill.billtypeId);
    if (this.alliedBill.billtypeId == 1) {
      this.alliedBill.billType = "ALLIED_CREDIT_BILL";
    } else {
      this.alliedBill.billType = "ALLIED_RETAIL_BILL";
    }

    if (this.selectedAlliedBillLevel == 3 || this.selectedAlliedBillLevel == 2) {
      this.setStandaloneData();
    }

    if (this.selectedAlliedBillLevel == 1) {
      this.setBillData();
    }

    this.alliedBill.alliedBillLevel = this.createFormGroup.get('alliedBillLevelFC').value.viewValue;
    this.alliedBill.alliedBillLevelId = this.selectedAlliedBillLevel;
    this.alliedBill.documentNumber = this.createFormGroup.get('docNumFC').value;
    let tempWb = "";

    if (this.alreadyExistsWaybillNumbers != null) {
      const alreadyExistsWbs = this.alreadyExistsWaybillNumbers.split(',');
      const enteredWbs = this.createFormGroup.get('wbFC').value.replace(/\s/g, "").split(',');
      console.log(alreadyExistsWbs);
      console.log(enteredWbs);

      enteredWbs.forEach(element => {
        if (!alreadyExistsWbs.includes(element)) {
          tempWb = tempWb + element + ",";
        }

      });
      tempWb = tempWb.substring(0, tempWb.length - 1);
      console.log("tempWb " + tempWb.length);

    } else {
      tempWb = this.createFormGroup.get('wbFC').value.replace(/\s/g, "");

    }
    this.alliedBill.waybillNumber = tempWb;
    if(this.selectedAlliedBillLevel==3){
      if(this.createFormGroup.get('wbFC').value!=null && this.createFormGroup.get('wbFC').value==='N/A'){
        this.alliedBill.waybillNumber= null;
      }
    }
    
    this.alliedBill.billDate = this.createFormGroup.get('billDateFC').value;
    this.alliedBill.billPeriodfrom = this.createFormGroup.get('billPeriodfromFC').value;
    this.alliedBill.billPeriodto = this.createFormGroup.get('billPeriodtoFC').value;
    console.log('tempWb', tempWb)
    if (this.selectedAlliedBillLevel == 1 || this.selectedAlliedBillLevel == 2) {
      if (tempWb.length == 0) {
        this._toastr.error('All waybills are already used for bill creation.');
        this.isHeadValid = false;
      } else {
        this.isHeadValid = true;
      }
    } else {
      this.isHeadValid = true;
    }
    // this.isHeadValid = true;
  }

  setStandaloneData() {
    this.alliedBill.billingAddress = this.createFormGroup.get('billingAddressFC').value;
    this.alliedBill.billToAddrLine1 = this.createFormGroup.get('billingAddressFC').value;
    this.alliedBill.billToAddrLine2 = null;
    this.alliedBill.billToAddrLine3 = null;
    this.alliedBill.billingBranch = this.createFormGroup.get('billingBranchFC').value.trim();
    this.alliedBill.billingLevel = this.createFormGroup.get('billingLevelFC').value.viewValue;
    this.alliedBill.billingLevelId = this.createFormGroup.get('billingLevelFC').value.value;
    this.alliedBill.billingLevelValue = this.createFormGroup.get('billingLevelValFC').value;
    this.alliedBill.collectionBranch = this.createFormGroup.get('collectionBranchFC').value.trim();
    this.alliedBill.submissionBranch = this.createFormGroup.get('submissionBranchFC').value.trim();
    this.alliedBill.gstin = this.createFormGroup.get('gstinFC').value;
    this.alliedBill.billToPincode = this.createFormGroup.get('pincodeFC').value.trim();

    if (this.selectedAlliedBillLevel == 2) {
      if (this.paidTopay.length > 0) {
        this.alliedBill.paidToPayStatus = this.paidTopay[0];
      }
    } else if (this.createFormGroup.get('paidOrTopayFC').value.viewValue != undefined && this.createFormGroup.get('paidOrTopayFC').value.viewValue != '') {
      this.alliedBill.paidToPayStatus = this.createFormGroup.get('paidOrTopayFC').value.viewValue.trim().replace('-', '');
    }

    if (this.selectedAlliedBillLevel == 3) {
      this.alliedBill.billToCustName = this.createFormGroup.get('custNameFC').value.trim();
    }
    if (this.alliedBill.gstin != "") {
      this.alliedBill.gstinRegdFlag = "Y";
    } else {
      this.alliedBill.gstinRegdFlag = "N";
    }
    this.creditCustDetails.forEach(element => {
      if (element.blngBrId == this.alliedBill.billingBranchId) {
        this.alliedBill.billToCustName = element.msaName;
        this.alliedBill.billToAddrId = element.billToAddrId;
        this.alliedBill.billToAddrLine1 = element.billToAddrLine1;
        this.alliedBill.billToAddrLine2 = element.billToAddrLine2;
        this.alliedBill.billToAddrLine3 = element.billToAddrLine3;
        this.alliedBill.billToLocation = element.billToLocation;
        this.alliedBill.billToPincode = element.billToPincode;

        this.alliedBill.gstinRegdFlag = element.gstinRegdFlag;
        this.alliedBill.billToCity = element.billToCity;
        this.alliedBill.billToState = element.billToState;
        this.alliedBill.eBillFlag = element.eBillFlag;
        this.alliedBill.email = element.email;
        this.alliedBill.msaId = element.msaId;
        this.alliedBill.msaCode = element.msaCode;
        this.alliedBill.sfxId = element.sfxId;
        this.alliedBill.sfxCode = element.sfxCode;
        this.alliedBill.rateCardId = element.rateCardId;
        this.alliedBill.rateCardCode = element.rateCardCode;
      }
    });
    this.alliedBill.billingBrGstNum = "";
    this.alliedBill.billingBrAddress = "";
    this.alliedBill.billingBrLocation = "";
    this.alliedBill.billingBrCity = "";
    this.alliedBill.billingBrState = "";
    this.alliedBill.billingBrPincode = 0;

    //this.alliedBill.prcId = this.createFormGroup.get('prcIdFc').value;
    this.alliedBill.prcCode = this.createFormGroup.get('prcIdFc').value;
    if (this.alliedBill.prcCode != null && this.alliedBill.prcCode != "" && this.alliedBill.prcCode != undefined) {
      this.alliedBill.prcNonPrc = "Y";
    } else {
      this.alliedBill.prcNonPrc = "N";
    }


  }

  setBillData() {
    console.log("inset bill");
    if (this.billDetails.length > 0) {
      this.alliedBill.billingAddress = this.billDetails[0].billToAddr;
      this.alliedBill.billingLevel = (typeof this.billDetails[0].billingLevel === 'undefined') ? "" : this.billDetails[0].billingLevel;
      this.alliedBill.billingLevelId = (typeof this.billDetails[0].blngLevelId === 'undefined') ? "" : this.billDetails[0].blngLevelId;
      this.alliedBill.billingLevelValue = (typeof this.billDetails[0].billingLevelCode === 'undefined') ? "" : this.billDetails[0].billingLevelCode;

      this.alliedBill.billingBranch = this.billDetails[0].blngBr;
      this.alliedBill.billingBranchId = this.billDetails[0].blngBrId;
      this.alliedBill.collectionBranch = this.billDetails[0].collBr;
      this.alliedBill.collectionBranchId = this.billDetails[0].collBrId;
      this.alliedBill.submissionBranch = this.billDetails[0].submsnBr;
      this.alliedBill.submissionBranchId = this.billDetails[0].submsnBrId;
      this.alliedBill.gstin = this.billDetails[0].gstNum;
      this.alliedBill.billToCustName = this.billDetails[0].billToCustName;
      this.alliedBill.billToAddrId = (typeof this.billDetails[0].billToAddrId === 'undefined') ? 0 : this.billDetails[0].billToAddrId;
      this.alliedBill.billToAddrLine1 = this.billDetails[0].billToAddrLine1;
      this.alliedBill.billToAddrLine2 = this.billDetails[0].billToAddrLine2;
      this.alliedBill.billToAddrLine3 = this.billDetails[0].billToAddrLine3;
      this.alliedBill.billToLocation = this.billDetails[0].billToLocation;
      this.alliedBill.billToPincode = this.billDetails[0].billToPincode;
      this.alliedBill.paidToPayStatus = this.billDetails[0].billType;
      if (typeof this.billDetails[0].gstinRegdFlag === 'undefined') {
        if (null != this.billDetails[0].gstNum && this.billDetails[0].gstNum != "") {
          this.alliedBill.gstinRegdFlag = "Y";
        } else {
          this.alliedBill.gstinRegdFlag = "N";
        }
      } else {
        this.alliedBill.gstinRegdFlag = this.billDetails[0].gstinRegdFlag;
      }

      this.alliedBill.billToCity = (typeof this.billDetails[0].billToCity === 'undefined') ? "" : this.billDetails[0].billToCity;
      this.alliedBill.billToState = (typeof this.billDetails[0].billToState === 'undefined') ? "" : this.billDetails[0].billToState;
      this.alliedBill.eBillFlag = (typeof this.billDetails[0].ebillFlag === 'undefined') ? "" : this.billDetails[0].ebillFlag;
      this.alliedBill.email = (typeof this.billDetails[0].email === 'undefined') ? "" : this.billDetails[0].email;
      this.alliedBill.billingBrGstNum = (typeof this.billDetails[0].blngBrGst === 'undefined') ? "" : this.billDetails[0].blngBrGst;
      this.alliedBill.billingBrAddress = this.billDetails[0].blngBrAddr;
      this.alliedBill.billingBrLocation = this.billDetails[0].blngBrLocation;
      this.alliedBill.billingBrCity = this.billDetails[0].blngBrCity;
      this.alliedBill.billingBrState = this.billDetails[0].blngBrState;
      this.alliedBill.billingBrPincode = this.billDetails[0].blngBrPincode;
      this.alliedBill.sfxId = (typeof this.billDetails[0].sfxId === "undefined") ? 0 : this.billDetails[0].sfxId;
      this.alliedBill.sfxCode = (typeof this.billDetails[0].sfxCode === "undefined") ? "" : this.billDetails[0].sfxCode;
      this.alliedBill.rateCardId = (typeof this.billDetails[0].rateCardId === "undefined") ? 0 : this.billDetails[0].rateCardId;
      this.alliedBill.rateCardCode = (typeof this.billDetails[0].rateCardCode === "undefined") ? "" : this.billDetails[0].rateCardCode;
      if(this.alliedBill.billType == "ALLIED_CREDIT_BILL"){
        this.alliedBill.msaId = Number(this.billDetails[0].custMsaId);
      }
      else{
        this.alliedBill.msaId = Number(this.billDetails[0].billToCustId);
      }
      this.alliedBill.msaCode = (typeof this.billDetails[0].custMsaCode === "undefined") ? "" : this.billDetails[0].custMsaCode;
      this.alliedBill.prcId = this.billDetails[0].prcId;
      this.alliedBill.prcCode = this.billDetails[0].prcCode;
      if (this.billDetails[0].prcCode != null && this.billDetails[0].prcCode != "") {
        this.alliedBill.prcNonPrc = "Y";
      } else {
        this.alliedBill.prcNonPrc = "N";
      }

    }

  }
  prcRBChange() {
    this.createFormGroup.controls.wbFC.setValue('');
    if(this.selectedAlliedBillLevel == 3) {
      this.createFormGroup.controls.wbFC.setValue('N/A');
    }
    this.createFormGroup.controls.docNumFC.setValue("");
    this.createFormGroup.controls.billPeriodfromFC.setValue(null);
    this.createFormGroup.controls.billPeriodtoFC.setValue(null);
    this.createFormGroup.controls.docNumFC.setValue("");
    this.createFormGroup.controls.prcIdFc.setValue("");
    this.createFormGroup.controls.billingLevelValFC.setValue("");
    this.createFormGroup.controls.billingBranchFC.setValue("");
    this.createFormGroup.controls.billingAddressFC.setValue("");
    this.createFormGroup.controls.gstinFC.setValue("");
    this.createFormGroup.controls.submissionBranchFC.setValue("");
    this.createFormGroup.controls.collectionBranchFC.setValue("");
    this.createFormGroup.controls.billDateFC.setValue("");
    this.createFormGroup.controls.pincodeFC.setValue("");
    this.createFormGroup.controls.paidOrTopayFC.setValue("");
    this.createFormGroup.controls.custNameFC.setValue("");
    const _prcNonPrc = this.createFormGroup.get('matRadioFc').value;
    if (_prcNonPrc === 'N') {
      this.isPRC = false;
      this.createFormGroup.controls.prcIdFc.setValue("");
    } else if (_prcNonPrc === 'Y') {
      this.isPRC = true;

    }

    const custNameFCControl = this.myForm.form.get('custNameFC');
    const prcIdFcControl = this.myForm.form.get('prcIdFc');
    if (this.selectedBillType == 2) {
      if (this.selectedAlliedBillLevel == 2 || this.selectedAlliedBillLevel == 3) {
        if (this.isPRC) {
          console.log('in is prc for prc id');
          prcIdFcControl.setValidators([Validators.required]);
          custNameFCControl.setValidators(null);
        } else {
          custNameFCControl.setValidators([Validators.required]);
          prcIdFcControl.setValidators(null);
        }
      } else {
        prcIdFcControl.setValidators(null);
        prcIdFcControl.setValidators(null);
      }
    } else {
      prcIdFcControl.setValidators(null);
      prcIdFcControl.setValidators(null);
    }
    prcIdFcControl.updateValueAndValidity();
    custNameFCControl.updateValueAndValidity();
  }

  // Method to fetch Credit->Bill Details
  getCreditBillDetails() {
    // if dates are already entred and searched for second bill
    this._spinner.show();
    if (this.createFormGroup.get('billPeriodfromFC').value || this.createFormGroup.get('billPeriodtoFC').value) {
      this.createFormGroup.controls.billPeriodfromFC.setValue(null);
      this.createFormGroup.controls.billPeriodtoFC.setValue(null);
    }
    this.documentNumber = this.createFormGroup.get('docNumFC').value;
    this.createFormGroup.controls.wbFC.setValue("");
    if (this.selectedBillType == 1) {
      this._alliedservice.getDocDetailsByDocNumber(this.documentNumber).subscribe(
        response => {
          console.log("Before response");
          console.log(response);
          if (response.length > 0) {
            this.billDetails = response;
            this.validateWaybillNumbers(String(this.billDetails[0].billNum));
            this.createFormGroup.controls.billingLevelFC.setValue(response[0].billingLevel);
            this.createFormGroup.controls.billingLevelValFC.setValue(response[0].billingLevelCode);
            this.createFormGroup.controls.billingBranchFC.setValue(response[0].blngBr);
            this.createFormGroup.controls.billingAddressFC.setValue(response[0].billToAddr);
            this.createFormGroup.controls.submissionBranchFC.setValue(response[0].submsnBr);
            this.createFormGroup.controls.collectionBranchFC.setValue(response[0].collBr);
			
          } else {
            this.billDetails = [];
            this._spinner.hide();
            this._toastr.error("No data found for the entred bill number.");
          }
        },
        error => {
          this._spinner.hide();
          this.billDetails = [];
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );

    }
    if (this.selectedBillType == 2) {
      this._alliedservice.getRetailBillDetailsByDocNumber(this.documentNumber).subscribe(
        response => {
          console.log('Retail Details: ', response);
          if (response.length > 0) {
            this.billDetails = response;
            this.validateWaybillNumbers(String(this.billDetails[0].billNum));
            this.setFormGroupValuesForRetail();
          } else {
            this.billDetails = [];
            this._toastr.error("No data found for the entred bill number.");
            this._spinner.hide();
          }

          //this.isDocNumValid=true;
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
  }

  cancelNext() {
    this.isNext = true;
    this.isHeadValid = false;
    // this.createFormGroup.controls.billDateFC.setValue(new Date());
    // this.createFormGroup.controls.billPeriodfromFC.setValue(null);
    // this.createFormGroup.controls.billPeriodtoFC.setValue(null);
  }

  setDateValue(selectedDate) {
    //console.log(selectedDate);
    this.toDateValue = selectedDate.value;
  }


  getSavedDataStatus(isSaved: string) {
    //this.isDataSaved = isSaved;
    if (isSaved === 'saved') {
      this.createFormGroup.reset();
      this.initForm1();
      this.setAlliedBillType();
      this.isHeadValid = false;
      this.isNext = true;
    }

  }

  initForm1(){
    this.billDetails = [];
    this.billSearched= false;
    this.isPRC = true;
    this.selectedAlliedBillLevel=0;
    this.createFormGroup = new FormGroup({
      billtypeFC: new FormControl('', [Validators.required]),
      alliedBillLevelFC: new FormControl('', [Validators.required]),
      docNumFC: new FormControl(''),
      billingLevelFC: new FormControl(''),
      billingLevelValFC: new FormControl(''),
      billingBranchFC: new FormControl(''),
      billingAddressFC: new FormControl('', [Validators.minLength(4)]),
      wbFC: new FormControl(''),
      insmtRefDtFC: new FormControl(''),
      submissionBranchFC: new FormControl(''),
      collectionBranchFC: new FormControl(''),
      gstinFC: new FormControl(''),
      billDateFC: new FormControl(new Date(), [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),
      matRadioFc: new FormControl(''),
      prcIdFc: new FormControl(''),
      custNameFC: new FormControl(''),
      pincodeFC: new FormControl('', [Validators.min(6)]),
      paidOrTopayFC: new FormControl('')
    });
  }

  //Validate Waybill numbers
  validateWaybillNumbers(billNum: string) {
    const isWaybillsExist = this.createFormGroup.get('wbFC').value;
    if (this.selectedAlliedBillLevel == 1 || this.selectedAlliedBillLevel == 2) {
      // this._spinner.show();
      let waybillRequest: WaybillRequest = {} as WaybillRequest;

      //waybillRequest.billType = this.createFormGroup.get('billtypeFC').value;
      waybillRequest.billType = "ALL";
      waybillRequest.billNumber = billNum;
      waybillRequest.waybillNumber = this.createFormGroup.get('wbFC').value.replace(/\s/g, "");
      this._alliedservice.postValidateWaybillNumbers(waybillRequest).subscribe(
        response => {
          console.log("in response");
          console.log(response);
          this._spinner.hide();
          this.paidTopay = response.wbNumValResp
            .map(waybill => waybill.paidToPayStatus)
            .filter((value, index, self) => self.indexOf(value) === index);
          console.log("test");
          console.log(this.paidTopay);
          if (this.paidTopay.length > 1) {
            this._toastr.error(response.message + "Waybills entered belongs to PAID and TOPAY both. Please enter eighter PAID or TOPAY.");
            this.isWaybillValid = false;
            this.isHeadValid = false;
            this.isNext = true;
          } else if (response.status == "Error") {
            const validatedWaybills = response.waybills.trim().slice(0, -1)
            this._toastr.error(response.message + " Waybill Numbers : " + validatedWaybills);
            this.isWaybillValid = false;
            this.isHeadValid = false;
            this.isNext = true;
          } else {
            const validatedWaybills = response.waybills.trim().slice(0, -1)
            this.createFormGroup.controls.wbFC.setValue(validatedWaybills);
            // if(!this.isNext){
            //   this.isHeadValid = true;
            // }
            this.billSearched = true;
            this.validatedBillWaybillAlreadyExists();
          }

        },
        error => {
          this._spinner.hide();
          console.log('inside waybill validations')
          this.isWaybillValid = false;
          //this.isHeadValid = false;
          //this.isNext = true;
          console.log(error);
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
    } else {
      this.isHeadValid = true;
    }

  }

  setFormValidators() {
    console.log('in set val');
    const docNumFCControl = this.myForm.form.get('docNumFC');
    const billingLevelFCControl = this.myForm.form.get('billingLevelFC');
    const billingLevelValFCControl = this.myForm.form.get('billingLevelValFC');
    const billingBranchFCControl = this.myForm.form.get('billingBranchFC');
    const billingAddressFCControl = this.myForm.form.get('billingAddressFC');
    const wbFCControl = this.myForm.form.get('wbFC');
    const insmtRefDtFCControl = this.myForm.form.get('insmtRefDtFC');
    const submissionBranchFCControl = this.myForm.form.get('submissionBranchFC');
    const collectionBranchFCControl = this.myForm.form.get('collectionBranchFC');
    const gstinFCControl = this.myForm.form.get('gstinFC');
    const matRadioFcControl = this.myForm.form.get('matRadioFc');
    const prcIdFcControl = this.myForm.form.get('prcIdFc');
    const custNameFCControl = this.myForm.form.get('custNameFC');


    this.myForm.form.get('alliedBillLevelFC').valueChanges
      .subscribe(alliedBillLevl => {
        console.log('observable ', alliedBillLevl);

        docNumFCControl.setValidators(null);
        billingLevelFCControl.setValidators(null);
        billingLevelValFCControl.setValidators(null);
        billingBranchFCControl.setValidators(null);
        billingAddressFCControl.setValidators(null);
        wbFCControl.setValidators(null);
        insmtRefDtFCControl.setValidators(null);
        submissionBranchFCControl.setValidators(null);
        collectionBranchFCControl.setValidators(null);
        gstinFCControl.setValidators(null);
        matRadioFcControl.setValidators(null);
        prcIdFcControl.setValidators(null);
        custNameFCControl.setValidators(null);

        if (alliedBillLevl.value === '1') {
          docNumFCControl.setValidators([Validators.required]);

        } else if (alliedBillLevl.value === '2' || alliedBillLevl.value === '3') {
          if (this.selectedBillType === 1) {
            billingLevelFCControl.setValidators([Validators.required]);
            billingLevelValFCControl.setValidators([Validators.required]);
          }
          billingBranchFCControl.setValidators([Validators.required]);
          billingAddressFCControl.setValidators([Validators.required]);
          submissionBranchFCControl.setValidators([Validators.required]);
          collectionBranchFCControl.setValidators([Validators.required]);
          // gstinFCControl.setValidators([Validators.required]);

        }
        if (alliedBillLevl.value === '2') {
          wbFCControl.setValidators([Validators.required]);
        }

        if (this.selectedBillType == 2) {
          if (this.selectedAlliedBillLevel == 2 || this.selectedAlliedBillLevel == 3) {
            if (this.isPRC) {
              prcIdFcControl.setValidators([Validators.required]);
            } else {
              custNameFCControl.setValidators([Validators.required]);
            }
            // } else {
            //   prcIdFcControl.setValidators(null);
            //   prcIdFcControl.setValidators(null);
            // }
          }
          //else {
          //  prcIdFcControl.setValidators(null);
          //  prcIdFcControl.setValidators(null);
        }

        docNumFCControl.updateValueAndValidity();
        billingLevelFCControl.updateValueAndValidity();
        billingLevelValFCControl.updateValueAndValidity();
        billingBranchFCControl.updateValueAndValidity();
        billingAddressFCControl.updateValueAndValidity();
        wbFCControl.updateValueAndValidity();
        insmtRefDtFCControl.updateValueAndValidity();
        submissionBranchFCControl.updateValueAndValidity();
        collectionBranchFCControl.updateValueAndValidity();
        // gstinFCControl.updateValueAndValidity();
        matRadioFcControl.updateValueAndValidity();
        prcIdFcControl.updateValueAndValidity();
        custNameFCControl.updateValueAndValidity();
      });
  }

  getCustByBillingLevel() {
    this.creditCustDetails = [];
    let request: BillingLevelRequest = {} as BillingLevelRequest;
    request.billingLevel = this.createFormGroup.get('billingLevelFC').value.value;
    request.billingLevelValue = this.createFormGroup.get('billingLevelValFC').value.trim().toUpperCase();
    console.log(request.billingLevelValue.substr(0, 3));
    if (request.billingLevelValue.length > 3) {
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'MSA' && request.billingLevelValue.substr(0, 3).toUpperCase() !== 'MSA') {
        this._toastr.error("MSA level value must start with MSA");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        return false;
      }
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'SFX' && request.billingLevelValue.substr(0, 3).toUpperCase() !== 'SFX') {
        this._toastr.error("SFX level value must start with SFX");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        return false;
      }
      if (this.createFormGroup.get('billingLevelFC').value.viewValue === 'RATE CARD' && request.billingLevelValue.substr(0, 2).toUpperCase() !== 'RC') {
        this._toastr.error("Rate Card level value must start with RC");
        this.createFormGroup.controls.billingLevelValFC.setValue("");
        return false;
      }

      this._spinner.show();
      this.createFormGroup.controls.billingBranchFC.setValue("");
      this.createFormGroup.controls.billingAddressFC.setValue("");
      this.createFormGroup.controls.submissionBranchFC.setValue("");
      this.createFormGroup.controls.collectionBranchFC.setValue("");
      this.createFormGroup.controls.gstinFC.setValue("");
      this._alliedservice.postGetCustByBillingLvl(request).subscribe(
        response => {
          this._spinner.hide();
          console.log(response);
          //response = JSON.parse(response);
          if (response.data != null) {
            let custDataList = response.data.cntrBlngResp;
            custDataList.forEach(custData => {
              let billingInfo = custData.billingInfo;
              if (billingInfo.length > 0) {
                billingInfo.forEach(element => {
                  let billingConfigs = element.billingConfigs;
                  if (element.billingLevelId == request.billingLevel) {
                    billingConfigs.forEach(billcongfig => {
                      let billOptions = billcongfig.billingByOptions;
                      billOptions.forEach(billOption => {
                        this.creditCustDetails.push({
                          billingLevel: billcongfig.billingLevel,
                          billingLevelValue: billcongfig.sfxNos,
                          billToAddr: (billOption.billToAddr.length > 0) ? billOption.billToAddr[0].addr1 : "",
                          billingByLevel: billOption.billingByLevel,
                          billingByLevelId: billOption.billingByLevelId,
                          billingByOptionId: billOption.billingByOptionId,
                          blngBr: billOption.blngBr,
                          blngBrId: billOption.blngBrId,
                          collBr: billOption.collBr,
                          collBrId: billOption.collBrId,
                          submsnBr: billOption.submsnBr,
                          submsnBrId: billOption.submsnBrId,
                          msaName: custData.msaName,
                          msaId: custData.msaId,
                          gstNum: billcongfig.gstNum,
                          gstinRegdFlag: billcongfig.gstinRegdFlag,
                          msaCode: element.msa,
                          sfxId: 0,
                          sfxCode: "",
                          rateCardId: 0,
                          rateCardCode: "",
                          email: billOption.ebillEmail,
                          eBillFlag: billcongfig.ebillFlag == 1 ? 'Y' : 'N',
                          billToAddrId: (billOption.billToAddr.length > 0) ? billOption.billToAddr[0].id : 0,
                          billToAddrLine1: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].addr1.length > 1) ? billOption.billToAddr[0].addr1 : null) : null,
                          billToAddrLine2: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].addr2.length > 1) ? billOption.billToAddr[0].addr2 : null) : null,
                          billToAddrLine3: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].addr3.length > 1) ? billOption.billToAddr[0].addr3 : null) : null,
                          billToLocation: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].city.length > 1) ? billOption.billToAddr[0].city : null) : null,
                          billToPincode: (billOption.billToAddr.length > 0) ? billOption.billToAddr[0].pincode : 0,
                          billToCity: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].city.length > 1) ? billOption.billToAddr[0].city : null) : null,
                          billToState: (billOption.billToAddr.length > 0) ? ((billOption.billToAddr[0].state.length > 1) ? billOption.billToAddr[0].state : null) : null
                        });

                      });
                    });

                  } else {
                    this._toastr.error("Billing level is different than selected. Please select correct billing level : " + element.billingLevel);
                  }


                });

              }
            });
          } else {
            if (response.errors.error != null && response.errors.error.length > 0) {
              this._toastr.error(response.errors.error[0].code + " " + response.message + ' Details: ' + response.errors.error[0].description);
            } else {
              this._toastr.error(response);
            }
          }

          console.log("Before print ");
          console.log(this.creditCustDetails);

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
  }

  validatePrcCust() {
    let prcCode = this.createFormGroup.get('prcIdFc').value;
    console.log("PRC Code" + prcCode);
    if (prcCode != "") {
      this._spinner.show();
      this._alliedservice.getPrcCustByPrcCode(prcCode).subscribe(
        response => {
          console.log("in response");
          console.log(response);
          if (response && response.data.prcContBillingResp) {
            const resp = response.data.prcContBillingResp;
            this.alliedBill.prcId = resp.prcCntrId;
            this.alliedBill.billToAddrLine1 = resp.addr;
            this.alliedBill.billToAddrLine2 = resp.addr2;
            this.alliedBill.billToAddrLine3 = resp.addr3;
            this.alliedBill.billingBrAddress = resp.addr + ", " + resp.addr2 ? resp.addr2 : '' + ", " + resp.addr3 ? resp.addr3 : '';
            this.alliedBill.billingBrPincode = resp.pincode;
            this.alliedBill.billToAddrId = resp.billToAddrMap;
            this.alliedBill.billToCustName = resp.name;
            this.createFormGroup.controls.custNameFC.setValue(resp.name);
            this.createFormGroup.controls.billingAddressFC.setValue(resp.addr);
            this.createFormGroup.controls.gstinFC.setValue(resp.gstinNum);
            this.createFormGroup.controls.pincodeFC.setValue(resp.pincode);
            console.log('esp.addr ', resp.addr);
            if (resp.billingBranches.length > 0) {

              resp.billingBranches.forEach(element => {
                this.billBranchIdPrc.push(element.branchId);
              });
            }
            console.log("before branch id in prc");
            console.log(this.billBranchIdPrc);
            this._spinner.hide();
          } else {
            this._spinner.hide();
            this._toastr.warning("PRC Customer does not exists.");
            this.createFormGroup.controls.prcIdFc.setValue("");
          }
        },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        });
    }

  }

  clearValues() {
    this.createFormGroup.controls.billingLevelValFC.setValue("");
    this.createFormGroup.controls.billingBranchFC.setValue("");
    this.createFormGroup.controls.billingAddressFC.setValue("");
    this.createFormGroup.controls.submissionBranchFC.setValue("");
    this.createFormGroup.controls.collectionBranchFC.setValue("");
    this.createFormGroup.controls.gstinFC.setValue("");
  }

  validatedBillWaybillAlreadyExists() {
    let waybillRequest: WaybillRequest = {} as WaybillRequest;
    waybillRequest.billType = this.alliedBill.billType;
    waybillRequest.billNumber = this.createFormGroup.get('docNumFC').value;
    waybillRequest.waybillNumber = this.createFormGroup.get('wbFC').value;

    this._alliedservice.postValidateBillWaybillNumbers(waybillRequest).subscribe(
      response => {
        console.log("in bilwaybill response");
        console.log(response);
        // this._spinner.hide();
        this.alreadyExistsWaybillNumbers = response.alreadyExistsWaybillNumbers;

      },
      error => {
        // this._spinner.hide();
        this.isWaybillValid = false;
        console.log('waybills issue');
        if (error.error.errorCode != null) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }


  public validateGST() {
    const gstin = this.createFormGroup.get('gstinFC').value.trim();
    const regex = new RegExp('^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$');
    if (gstin != "" && !regex.test(gstin)) {
      this._toastr.info("Please enter a valid GSTIN number in proper format.", '', { closeButton: false, timeOut: 4000, progressBar: false, enableHtml: true });
      this.createFormGroup.controls.gstinFC.setValue("");
    }
  }

  public setAlliedBillType() {
    if (this._activatedRouter.snapshot.url[1].path === 'retail') {
      this.alliedBill.billType = "ALLIED_RETAIL_BILL";
      this.selectedBillType = 2;
      this.createFormGroup.controls.billtypeFC.setValue("RETAIL");
    } else {
      this.alliedBill.billType = "ALLIED_CREDIT_BILL";
      this.selectedBillType = 1;
      this.createFormGroup.controls.billtypeFC.setValue("CREDIT");
    }
  }

  // billing level look up
  paidToPayLookup() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DEVIATION_WAYBILL_TYPE').subscribe(
      response => {
        console.log(response);
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.paidOrToPaylist = [...this.paidOrToPaylist, { value: lkps.id, viewValue: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  validatePincode() {
    let pincode = this.createFormGroup.get('pincodeFC').value;
    console.log("rrrr" + pincode);
    if (pincode != "" && pincode.length >= 6) {
      this._spinner.show();
      this._alliedservice.getPincodeDetailsByPincode(pincode).subscribe(
        response => {
          console.log("in response");
          console.log(response);
          console.log(response.data.length);
          if (!(response.data.length > 0)) {
            this._toastr.error("Entered pincode is not valid.");
          }
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        });
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
    if (this.isPRC) {
      this._alliedservice.getBranchDetailsByBranchId(branchId).subscribe(
        response => {
          let dataResponse = response['data'];
          this.createFormGroup.controls.submissionBranchFC.setValue("    " + dataResponse.branchName);
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
  }

  callBranchApiByCollBranchId(branchId: number) {

    if (this.isPRC) {
      this._spinner.show();
      this._alliedservice.getBranchDetailsByBranchId(branchId).subscribe(
        response => {
          this._spinner.hide();
          let dataResponse = response['data'];

          this.createFormGroup.controls.collectionBranchFC.setValue("    " + dataResponse.branchName);

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
  }

  get alliedBillLevelFC() {
    return this.createFormGroup.get('alliedBillLevelFC') as FormControl;
  }

  get pincodeFC() {
    return this.createFormGroup.get('pincodeFC') as FormControl;
  }

  get paidOrTopayFC() {
    return this.createFormGroup.get('paidOrTopayFC') as FormControl;
  }

  get billtypeFC() {
    return this.createFormGroup.get('billtypeFC') as FormControl;
  }

  updateFormValiditiesForPincodeAndPaidToPay() {
    this.alliedBillLevelFC.valueChanges.subscribe(selectedValue => {
      if(selectedValue.value == 2 || selectedValue.value == 3) {
        this.pincodeFC.setValidators([Validators.required, Validators.min(6)]);
      }
      else {
        this.pincodeFC.setValidators(null);
      }
      if(selectedValue.value == 3) {
        this.paidOrTopayFC.setValidators([Validators.required]);
      }
      else {
        this.paidOrTopayFC.setValidators(null);
      }
      this.pincodeFC.updateValueAndValidity();
      this.paidOrTopayFC.updateValueAndValidity();
    });
  }

  setFormGroupValuesForRetail() {
    //these values are required so as to make the form valid.
    //Bill Date, Period From and Period To are set automatically on selection
    this.createFormGroup.controls.billingLevelFC.setValue(this.billDetails[0].billingLevel);
    this.createFormGroup.controls.billingLevelValFC.setValue(this.billDetails[0].billingLevelCode);
    this.createFormGroup.controls.billingBranchFC.setValue(this.billDetails[0].blngBr);
    this.createFormGroup.controls.billingAddressFC.setValue(this.billDetails[0].billToAddr);
    this.createFormGroup.controls.submissionBranchFC.setValue(this.billDetails[0].submsnBr);
    this.createFormGroup.controls.collectionBranchFC.setValue(this.billDetails[0].collBr);
    this.createFormGroup.controls.pincodeFC.setValue(this.billDetails[0].billToPincode);
  }
}

