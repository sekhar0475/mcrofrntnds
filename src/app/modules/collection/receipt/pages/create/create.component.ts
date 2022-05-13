import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Receipt } from '../../models/receipt.model';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from './dialog/dialog.component';
import { ReceiptService } from '../../services/receipt.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ToastrService } from 'ngx-toastr';
import { Customer } from '../../models/customer';
import { CreditCustomerSearchComponent } from './credit-customer-search/credit-customer-search.component';
import { RetailCustomer } from '../../models/retail-customer';
import { RetailCustomerSearchComponent } from './retail-customer-search/retail-customer-search.component';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';

// for mode
interface ReceiptModeList {
  value: string;
  viewValue: string;
  viewDescr: string;
  oraReceiptMethod: string;
}

// for customer type
interface ReceiptCustTypeList {
  value: string;
  viewValue: string;
  viewDescr: string;
}

// for bank account
interface SafexbankAccountList {
  value: string;
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
  fileToUpload: File = null;
  receipt: Receipt = {} as Receipt;
  receiptNum: string;
  receiptId: number;
  writeAccess = true;
  receipts: Receipt[] = []; // set the post response
  todayDt: Date = new Date();
  createFormGroup: FormGroup;
  minDate: Date;
  maxDate: Date;
  disableBank = true;
  enableCustomerBank = true;
  disableBillingLevel = true;
  paymentMode;
  modeList: ReceiptModeList[] = []; // for mode LOV
  custTypeList: ReceiptCustTypeList[] = []; // for Customer type Lov
  customerList: Customer[] = [];
  bankAccList: SafexbankAccountList[] = [];
  retailList: RetailCustomer[] = [];
  constructor(private _dialog: MatDialog,
              private _router: Router,
              private _receiptService: ReceiptService,
              private _toastr: ToastrService,
              private _tokenStorage: TokenStorageService,
              private _spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.minDateFn();
    this.maxDateFn();
    this.setPermissions();
  }

  // set the permissions
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
      return;
    } else if (this._tokenStorage.getCurrentModuleUpdateFlag() != null && this._tokenStorage.getCurrentModuleUpdateFlag() === 'Y') {
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
    }
  }

  loadData() {
    this._spinner.show();
    this.receipt.insmtRefDt = new Date();
    // get the lookup values.
    this._receiptService.getLookupValuesByType('BIL_COLLECTION_MODE').subscribe(
      response => {
        response.data.forEach(
          lkps => {
            this.modeList = [...this.modeList, { value: lkps.id, viewValue: lkps.lookupVal, viewDescr: lkps.descr, oraReceiptMethod: lkps.attr1 }];
          });
        // get customer type
        this._receiptService.getLookupValuesByType('BILL_COLL_CUST_TYPE').subscribe(
          response => {
            response.data.forEach(
              lkps => {
                this.custTypeList = [...this.custTypeList, { value: lkps.id, viewValue: lkps.lookupVal, viewDescr: lkps.descr }];
              });
            this._spinner.hide();
          }, error => {
            this._spinner.hide();
            this.handleError(error);
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // show error details.
  handleError(error) {
    if (error.error != null && error.error.errorMessage != null) {
      this._toastr.warning(error.error.errorMessage);
    } else {
      this._toastr.warning(error.message);
    }
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      modeFC: new FormControl('', [Validators.required]),
      CustomerTypeFC: new FormControl('', [Validators.required]),
      customerNameFC: new FormControl('', [Validators.required]),
      billingLevelFC: new FormControl(''),
      freightAmtFC: new FormControl(''),
      TdsAmtFC: new FormControl(''),
      insmtRefFC: new FormControl('', [Validators.required]),
      insmtRefDtFC: new FormControl('', [Validators.required]),
      gstTdsAmtFC: new FormControl(''),
      custbankAccFC: new FormControl('', [Validators.required]),
      custBankBrFC: new FormControl('', [Validators.required]),
      safexBankAccFC: new FormControl(''),
      tanNumFC: new FormControl(''),
      remarksFC: new FormControl(''),
    });
  }

  // to convert date to yyyy-mm-dd format
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


  // min date for refernce column
  minDateFn() {
    this.minDate = new Date(this.convert(this.todayDt));
    this.minDate.setDate(this.minDate.getDate() - 2);
  }
  // max date for reference date
  maxDateFn() {
    this.maxDate = new Date(this.convert(this.todayDt));
    this.maxDate.setDate(this.maxDate.getDate() + 2);
  }

  // dummy function to handel file
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  // create and validation check for receipt creation page
  validateReceiptData() {
    this.receipt = ({
      mode: this.receipt.mode,
      insmtType: this.receipt.mode,
      receiptNum: this.receipt.receiptNum,
      receiptId: this.receipt.receiptId,
      custId: this.receipt.custId,
      custType: this.receipt.custType,
      custName: this.receipt.custName,
      billingLevel: this.receipt.billingLevel,
      billingLevelId: this.receipt.billingLevelId,
      billingLevelValue: this.receipt.billingLevelValue,
      totRecFrtAmt: this.receipt.totRecFrtAmt,
      totRecFrtTdsAmt: this.receipt.totRecFrtTdsAmt,
      totRecGstTdsAmt: this.receipt.totRecGstTdsAmt,
      insmtRef: this.receipt.insmtRef,
      insmtRefDt: this.receipt.insmtRefDt,
      custBankBr: this.receipt.custBankBr,
      custbankAcc: this.receipt.custbankAcc,
      safexBankAcc: this.receipt.safexBankAcc,
      tanNum: this.receipt.tanNum,
      remarks: this.receipt.remarks,
      oraReceiptMethod: this.receipt.oraReceiptMethod,
      attachmentfileName: (this.fileToUpload != null ? this.fileToUpload.name : null),
      s3BucketName: ''
    });

    // either freight amount, TDS amount or GST tds amount is mandatory
    if (this.receipt.totRecFrtAmt == null &&
      this.receipt.totRecFrtTdsAmt == null &&
      this.receipt.totRecGstTdsAmt == null) {
      this._toastr.warning('Either Freight amount, TDS amount or GST TDS amount is mandatory');
    }
  }

  createReceipt() {
    // Data validation
    this.validateReceiptData();

    // post data to data base
    if (!this._toastr.currentlyActive) {
      this._spinner.show();
      let uploadStatus = true;
      let uploadMsg = null;
      this._receiptService.postReceipts(this.receipt).subscribe(
        response => {
          this.receipts = response;
          const _receiptNum = this.receipts['receiptNum'.toString()];
          const _receiptId = this.receipts['receiptId'.trim()];
          if (this.fileToUpload != null) {
            const fileName = this.receipts['attachmentfileName'.toString()]; 
            this._receiptService.onUpload(this.fileToUpload, fileName).subscribe(
              () => {
                uploadStatus = true;
              },
              error => {
                console.log(error);
                uploadMsg = error;
                uploadStatus = false;
                console.log(error);
                if (error.error != null && error.error.errorCode != null) {
                  this._toastr.warning('Receipt has been created successfully. Receipt Numner: '+_receiptId+ 'Error Uploading attachment: '+error.error.errorMessage + ' Details: ' + error.error.errorDetails);
                } else {
                  this._toastr.warning(error.message);
                }
              }
            );
          }
          this._spinner.hide();
          // call upload service
          this.openApplicationDialog(_receiptId, _receiptNum, uploadStatus, uploadMsg);
        },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error != null && error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage);// ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
    }
  }

  // to display receipt number after creation
  openApplicationDialog(receiptId: number, receiptNum: string, uploadStatus: boolean, uploadMsg: string) {
    let msg = null;
    if (uploadStatus) {
      msg = 'Receipt Number (' + receiptNum + ')  created successfully !';
    } else {
      msg = 'Receipt Number (' + receiptNum + ')  created successfully !. Attachment upload failed. Error Msg: ' + uploadMsg;
    }
    const dialogRef = this._dialog.open(DialogComponent, {
      data: msg
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._router.navigate(['/collection/receipt-apply', receiptId]);
      } else {
        this.resetFormControl();  
        this.receipt = {} as Receipt;
        this.receipt.insmtRefDt = new Date();
        this._router.navigate(['/collection/receipt-create']);
      }
    });
  }

  // action on cancel button
  openCancelDialog() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Unsaved data will be lost. Please confirm whether you want to continue?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {   
        this.resetFormControl();     
        this.receipt = {} as Receipt;
        this.receipt.insmtRefDt = new Date();
        this._router.navigate(['/collection/receipt-create']);
      } else {
        // do nothing
      }
    });
  }

//reset form control
resetFormControl(){
this.createFormGroup.get('modeFC').reset();
this.createFormGroup.get('CustomerTypeFC').reset();
this.createFormGroup.get('customerNameFC').reset();
this.createFormGroup.get('insmtRefFC').reset();
this.createFormGroup.get('insmtRefDtFC').reset();
this.createFormGroup.get('custbankAccFC').reset();
this.createFormGroup.get('custBankBrFC').reset();
}

  // set bank account on selecting mode.
  setBankAccount(mode) {
    this.paymentMode = mode.viewValue;
    //reset the values.
    this.createFormGroup.get('TdsAmtFC').enable();
    this.createFormGroup.get('freightAmtFC').enable();
    this.createFormGroup.get('gstTdsAmtFC').enable();  
    //if mode is CASH default the Reference Number
    if((mode.viewValue).includes('CASH')){
      //reset customer bank and branch fields.
      this.createFormGroup.get('custbankAccFC').reset();
      this.createFormGroup.get('custBankBrFC').reset();
      // make customer bank accoutn n branch non mandaotry.
      this.createFormGroup.controls['custbankAccFC'].clearValidators();
      this.createFormGroup.controls['custbankAccFC'].updateValueAndValidity();
      this.createFormGroup.controls['custBankBrFC'].clearValidators();
      this.createFormGroup.controls['custBankBrFC'].updateValueAndValidity();
      

      var temp = new Date(); 
      var dateStr = temp.getFullYear().toString() + 
                    temp.getMonth().toString() + 
                    temp.getDate().toString() + 
                    temp.getHours().toString() + 
                    temp.getMinutes().toString() + 
                    temp.getSeconds().toString();
      this.receipt.insmtRef ='CASH_'+dateStr;
      this.createFormGroup.get('insmtRefFC').disable();
    }
    else{
      this.receipt.insmtRef=null;
      this.createFormGroup.get('insmtRefFC').enable();
         //reset customer bank and branch fields.
         this.createFormGroup.get('custbankAccFC').reset();
         this.createFormGroup.get('custBankBrFC').reset();
         this.createFormGroup.controls['custbankAccFC'].setValidators( [Validators.required]);
         this.createFormGroup.controls['custBankBrFC'].setValidators( [Validators.required]);
    }
    this.bankAccList = [];
    if (mode.viewValue != null) {
      this.receipt.oraReceiptMethod = mode.oraReceiptMethod;
      // disable safex bank account for TDS & GST Advice
      if (mode.viewValue != null && (mode.viewValue).includes('TDS') || 
                                     mode.viewValue.includes('GST')) {
        this.disableBank = true;
        this.receipt.safexBankAcc = null;
        // customer bank account details not required
        this.enableCustomerBank = false;
        this.createFormGroup.get('custbankAccFC').setValue('N/A');
        this.createFormGroup.get('custBankBrFC').setValue('N/A');
        //disable freight and gst tds.
        this.createFormGroup.get('freightAmtFC').setValue(0);
        this.createFormGroup.get('freightAmtFC').disable();        
        if(mode.viewValue.includes('GST')){
          this.createFormGroup.get('TdsAmtFC').setValue(0);
          this.createFormGroup.get('TdsAmtFC').disable();          
        }
        if(mode.viewValue.includes('TDS')){
          this.createFormGroup.get('gstTdsAmtFC').setValue(0);
          this.createFormGroup.get('gstTdsAmtFC').disable();  
        }

      } else {
        // enable customer bank.
        this.enableCustomerBank = true;
        this.receipt.custBankBr = null;
        this.receipt.custbankAcc = null;
        // fetch the bank account details
        this._spinner.show();
        this._receiptService.getBranchBankAccount().subscribe(
          response => {
            console.log('branch account details:');
            console.log(response);
            if (response != null && response.data != null) {
              if ((mode.viewValue).includes('CASH') || (mode.viewValue).includes('CHECK')) {
                this.disableBank = true;
                this.receipt.safexBankAcc = response.data.bankAccNumOnline;
                // add to branch list
                this.bankAccList.push({ value: response.data.bankAccNumOnline });
              } else if ((mode.viewValue).includes('RTGS') || 
                         (mode.viewValue).includes('NEFT') || 
                         (mode.viewValue).includes('UPI') || 
                         (mode.viewValue).includes('IMPS')) {
                this.disableBank = true;
                this.receipt.safexBankAcc = response.data.bankAccNumOffline;
                // add to branch list
                this.bankAccList.push({ value: response.data.bankAccNumOffline });
              } else {
                this.disableBank = false;
                // add to branch list
                this.bankAccList = [...this.bankAccList, { value: response.data.bankAccNumOffline }];
                if(response.data.bankAccNumOffline != response.data.bankAccNumOnline && response.data.bankAccNumOnline!=null && response.data.bankAccNumOffline!=null ){
                  this.bankAccList = [...this.bankAccList, { value: response.data.bankAccNumOnline }];
                }
              }
            }
            this._spinner.hide();
          }, error => {
            this._spinner.hide();
            this.handleError(error);
          }
        );
      }
    }
  }

  // on change in customer type
  setCustomerType(customer) {
    // reset customer selection
    this.receipt.custName = null;
    this.receipt.custId = null;
    this.receipt.billingLevel = null;
    this.receipt.billingLevelValue = null;
    this.receipt.billingLevelId = null;
    this.receipt.tanNum = null;

    if (customer.viewValue != null && (customer.viewValue).includes('CREDIT')) {
      // enable billing level
      this.disableBillingLevel = true;
      // call customer service
      this.customerList = [];
      this._spinner.show();
      this._receiptService.getCreditCustomer(customer.viewValue).subscribe(
        response => {
          this.customerList = response;
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    } else if (customer.viewValue != null && (customer.viewValue).includes('ALLIED')) {
      // disable billing level
      this.disableBillingLevel = false;
      // call customer service
      this.customerList = [];
      this._spinner.show();
      this._receiptService.getAlliedNonPrcCustomer().subscribe(
        response => {
          this.retailList = [];
          this.retailList = response;
          this.retailList.forEach(row => {
            this.customerList.push({
              aliasName: null,
              billConfigId: null,
              billingLevel: null,
              billingLevelValue: null,
              collectionBranchId: null,
              custId: row.id,
              custName: row.name,
              tanNumber: null
            });
          });
          this._spinner.hide();
        }
      );

    } else if (customer.viewValue != null) {
      // disable billing level
      this.disableBillingLevel = false;
      // call customer service
      this.customerList = [];
      let type = null;
      if (customer.viewValue.includes('TO_PAY')) {
        type = 'TO-PAY';
      } else if (customer.viewValue.includes('PRC')) {
        type = 'PRC';
      } else if (customer.viewValue.includes('PAID')) {
        type = 'PAID';
      }
      this._spinner.show();
      this._receiptService.getRetailCustomer(type).subscribe(
        response => {
          this.retailList = [];
          this.retailList = response;
          this.retailList.forEach(row => {
            this.customerList.push({
              aliasName: null,
              billConfigId: null,
              billingLevel: null,
              billingLevelValue: null,
              collectionBranchId: null,
              custId: row.id,
              custName: row.name,
              tanNumber: row.tanNum
            });
          });
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );

    }
  }
  // find customer
  findCustomer() {
    if (this.customerList.length > 0) {
      if (this.receipt.custType.includes('CREDIT')) {
        const dialogRef = this._dialog.open(CreditCustomerSearchComponent, { data: this.customerList });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result[0] != null) {
              this.receipt.custName = result[0].custName;
              this.receipt.custId = result[0].custId;
              this.receipt.billingLevel = result[0].billingLevel;
              this.receipt.billingLevelValue = result[0].billingLevelValue;
              this.receipt.billingLevelId = result[0].billConfigId;
              this.receipt.tanNum = result[0].tanNumber;
            }
          }
        });
      } else {
        const dialogRef = this._dialog.open(RetailCustomerSearchComponent, { data: this.customerList });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result[0] != null) {
              this.receipt.custName = result[0].custName;
              this.receipt.custId = result[0].custId;
              this.receipt.tanNum = result[0].tanNumber;
            }
          }
        });

      }
    } else {
      // customer type is selected
      if (this.receipt.custType == null) {
        // throw a warning that no customer found for the given customer type and collection branch
        this._toastr.warning('Please select a customer type.');
      } else {
        // throw a warning to select the customer type
        this._toastr.warning('No customer data for found for the selected customer type and branch');
      }
    }
  }
}
