import { AlliedBillingService } from './../../../services/allied-billing.service';
import { AlliedBillRequest } from './../../../models/allied-bill-request.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, DateAdapter, MAT_DATE_FORMATS, MatDialog } from '@angular/material';
import { AlliedLine } from '../../../models/allied-line.model';
import { AlliedBill } from '../../../models/allied-bill.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlliedBillReasons } from '../../../models/allied-bill-reasons.model';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { DatePipe } from '@angular/common'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { ConfirmationSuccessDialogComponent } from 'src/app/shared/components/confirmation-success-dialog/confirmation-success-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
@Component({
  selector: 'app-lines',
  templateUrl: './lines.component.html',
  styleUrls: ['./lines.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS },
    DatePipe
  ]
})
export class LinesComponent implements OnInit {
  todayDate: Date = new Date();
  @Input() alliedBillVal: AlliedBill;
  billStateCode : string = "";
  cgstTaxPercentage: number = 9;
  IgsttaxPercentage: number = 18;
  dataSource: MatTableDataSource<AlliedLine> = new MatTableDataSource();
  displayedColumns: string[] = ['lineNumber','reason', 'amount', 'remarks', 'sgst', 'cgst', 'igst', 'total', 'delete'];
  displayedColumnsTaxTotal: string[] = ['taxTotLbl','taxReason','taxAmt','taxRemarks','sgstTot','cgstTot','igstTot','taxTot','taxDelete'];
  displayedColumnsFinTotal: string[] = ['finTotLbl','finReason','finAmt','finRemarks','finSgst','finCgst','finIgst','finTot','finDelete'];
  linesData: AlliedLine[]=[];
  alliedBillReq: AlliedBillRequest;
  billReasonsList: AlliedBillReasons[] = [];
  billingBrGstNum : string;
  billingBrAddress : string;
  billingBrLocation : string;
  billingBrCity : string;
  billingBrState : string;
  billingBrPincode : number;
  errorMessage: ErrorMsg;

  @Input() documentNumber: string;
  @Output() displayResultComponentChange = new EventEmitter<string>();

  constructor(private _alliedservice : AlliedBillingService
    , public _toastr: ToastrService
    , private _spinner: NgxSpinnerService
    , private _lookupService : LookupService
    , private _datePipe : DatePipe
    , public _dialogs: MatDialog
    , private _router: Router) { }

  ngOnInit() {
    this.loadData();
    this.getReasonsList();
    this.getBranchGstNumber();
    console.log(this.alliedBillVal);
   
  }

  loadData(){
    //console.log('validating',this.alliedBillVal.alliedBillLevel);
    if(this.alliedBillVal.waybillNumber != null && this.alliedBillVal.alliedBillLevelId == 1 || this.alliedBillVal.waybillNumber != null && this.alliedBillVal.alliedBillLevelId == 2){
      this.displayedColumns = ['lineNumber','waybill','reason', 'amount', 'remarks', 'sgst', 'cgst', 'igst', 'total', 'delete'];
      this.displayedColumnsTaxTotal = ['taxTotLbl','taxWaybill','taxReason','taxAmt','taxRemarks','sgstTot','cgstTot','igstTot','taxTot','taxDelete'];
      this.displayedColumnsFinTotal = ['finTotLbl','finWaybill','finReason','finAmt','finRemarks','finSgst','finCgst','finIgst','finTot','finDelete'];
      this.alliedBillVal.waybillNumber.split(',').forEach( wb =>{ this.addNewLineWithWaybillNum(wb);});
    }
  }

  initAliiedBills(){
    this.alliedBillVal.billtypeId = null;
    this.alliedBillVal.billType = null;
    this.alliedBillVal.alliedBillLevel = null;
    this.alliedBillVal.alliedBillLevelId = null;
    this.alliedBillVal.prcNonPrc = null;
    this.alliedBillVal.prcId = null;
    this.alliedBillVal.documentNumber = null;
    this.alliedBillVal.waybillNumber = null;
    this.alliedBillVal.billingLevel = null;
    this.alliedBillVal.billingLevelId = null;
    this.alliedBillVal.billingLevelValue = null;
    this.alliedBillVal.billingBranchId = null;
    this.alliedBillVal.billingBranch = null;
    this.alliedBillVal.billingAddress = null;
    this.alliedBillVal.gstin = null;
    this.alliedBillVal.submissionBranch = null;
    this.alliedBillVal.submissionBranchId = null;
    this.alliedBillVal.collectionBranch = null;
    this.alliedBillVal.collectionBranchId = null;
    this.alliedBillVal.billDate = null;
    this.alliedBillVal.billPeriodfrom = null;
    this.alliedBillVal.billPeriodto = null;
    this.alliedBillVal.totaltaxAmount = null;
    this.alliedBillVal.totalBillAmount = null;
    this.alliedBillVal.igstAmount = null;
    this.alliedBillVal.cgstAmount = null;
    this.alliedBillVal.sgstAmount = null;
    this.alliedBillVal.baseAmount = null;
  }

  deleteAlliedLines(index){
    this.dataSource.data.splice(index, 1);
    let srNo = 1;
    this.dataSource.data.forEach(element => {
      element.lineNumber = srNo;
      srNo++
    });
    this.dataSource = new MatTableDataSource(this.dataSource.data);

  }

  calcTax(index){
    console.log(this.alliedBillVal.gstinRegdFlag);
      let tempAlliedline = this.dataSource.data[index];
    let tempAmt = tempAlliedline.amount;
    tempAlliedline.igst = Number(0);
    tempAlliedline.cgst = Number(0);
    tempAlliedline.sgst = Number(0);
    if(this.alliedBillVal.gstinRegdFlag === 'Y'){
    if ((this.alliedBillVal.gstin != undefined && (this.alliedBillVal.gstin).substring(0,2)) === (this.billStateCode != undefined && (this.billStateCode).substring(0,2))) {
      let tempEachPercentage = this.cgstTaxPercentage
      tempAlliedline.igst = Number(0);
      tempAlliedline.cgst = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
      tempAlliedline.sgst = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
    } else {
      let tempEachPercentage = this.IgsttaxPercentage
      tempAlliedline.igst = Number(((tempAmt * tempEachPercentage) / 100).toFixed(2));
      tempAlliedline.cgst = Number(0);
      tempAlliedline.sgst = Number(0);
    }
    
  }    
    tempAlliedline.total = Number((tempAlliedline.amount).toFixed(2));
    tempAlliedline.totalTaxAmount = Number((tempAlliedline.cgst + tempAlliedline.sgst + tempAlliedline.igst).toFixed(2));
    this.dataSource.data[index] = tempAlliedline;

  }

  createAlliedBill(){
    // if ((typeof this.billStateCode === 'undefined' || this.billStateCode === "") && (typeof this.alliedBillVal.gstinRegdFlag != 'undefined' && this.alliedBillVal.gstinRegdFlag == 'Y')){
    //   this._toastr.error("No Company GST Number Found.");
    // }else{ 
      this.alliedBillVal.igstAmount = this.getIgstTotal();
    this.alliedBillVal.cgstAmount = this.getCgstTotal();
    this.alliedBillVal.sgstAmount = this.getSgstTotal();
    this.alliedBillVal.totalBillAmount = this.getFinTotal();
    this.alliedBillVal.totaltaxAmount = this.getTaxTotal();
    this.alliedBillVal.baseAmount = this.getLineTotal();

    this.alliedBillReq ={
      billtypeId: this.alliedBillVal.billtypeId,
      billType: this.alliedBillVal.billType,
      alliedBillLevel: this.alliedBillVal.alliedBillLevel,
      alliedBillLevelId: this.alliedBillVal.alliedBillLevelId,
      prcNonPrc: this.alliedBillVal.prcNonPrc,
      prcId: this.alliedBillVal.prcId,
      documentNumber: this.alliedBillVal.documentNumber,
      waybillNumber: this.alliedBillVal.waybillNumber,
      billingLevel: (typeof this.alliedBillVal.billingLevel === 'undefined') ? "" : this.alliedBillVal.billingLevel,
      billingLevelId: (typeof this.alliedBillVal.billingLevelId === 'undefined') ? "" : this.alliedBillVal.billingLevelId,
      billingLevelValue: this.alliedBillVal.billingLevelValue,
      billingBranchId: this.alliedBillVal.billingBranchId,
      billingBranch: this.alliedBillVal.billingBranch,
      billingAddress: this.alliedBillVal.billingAddress,
      gstin: this.alliedBillVal.gstin,
      submissionBranch: this.alliedBillVal.submissionBranch,
      submissionBranchId: this.alliedBillVal.submissionBranchId,
      collectionBranch: this.alliedBillVal.collectionBranch,
      collectionBranchId: this.alliedBillVal.collectionBranchId,
      billDate: this._datePipe.transform(this.alliedBillVal.billDate, 'yyyy-MM-dd HH:mm:ss'),
      billPeriodfrom: this._datePipe.transform(this.alliedBillVal.billPeriodfrom, 'yyyy-MM-dd HH:mm:ss'),
      billPeriodto: this._datePipe.transform(this.alliedBillVal.billPeriodto, 'yyyy-MM-dd HH:mm:ss'),
      totaltaxAmount: this.alliedBillVal.totaltaxAmount,
      totalBillAmount: this.alliedBillVal.totalBillAmount,
      igstAmount: this.alliedBillVal.igstAmount,
      cgstAmount: this.alliedBillVal.cgstAmount,
      sgstAmount: this.alliedBillVal.sgstAmount,
      baseAmount: this.alliedBillVal.baseAmount,
      custName : (typeof this.alliedBillVal.billToCustName === 'undefined') ? "" : this.alliedBillVal.billToCustName,
      billToAddrId : (typeof this.alliedBillVal.billToAddrId === 'undefined') ? 0 : this.alliedBillVal.billToAddrId,
      billToAddrLine1 : (typeof this.alliedBillVal.billToAddrLine1 === 'undefined') ? "" : this.alliedBillVal.billToAddrLine1,
      billToAddrLine2 : (typeof this.alliedBillVal.billToAddrLine2 === 'undefined') ? "" : this.alliedBillVal.billToAddrLine2,
      billToAddrLine3 : (typeof this.alliedBillVal.billToAddrLine3 === 'undefined') ? "" : this.alliedBillVal.billToAddrLine3,
      billToLocation : (typeof this.alliedBillVal.billToLocation === 'undefined') ? "" : this.alliedBillVal.billToLocation,
      billToPincode : (typeof this.alliedBillVal.billToPincode === 'undefined') ? 0 : this.alliedBillVal.billToPincode,  
      paidToPayStatus : (typeof this.alliedBillVal.paidToPayStatus === 'undefined') ? "" : this.alliedBillVal.paidToPayStatus,  
      prcCode : this.alliedBillVal.prcCode,
      gstinRegdFlag : (typeof this.alliedBillVal.gstinRegdFlag === 'undefined') ? "" : this.alliedBillVal.gstinRegdFlag,
      billToCity : (typeof this.alliedBillVal.billToCity === 'undefined') ? "" : this.alliedBillVal.billToCity,
      billToState : (typeof this.alliedBillVal.billToState === 'undefined') ? "" : this.alliedBillVal.billToState,
      eBillFlag : (typeof this.alliedBillVal.eBillFlag === 'undefined') ? "" : this.alliedBillVal.eBillFlag,
      email : (typeof this.alliedBillVal.email === 'undefined') ? "" : this.alliedBillVal.email,
      billingBrGstNum : this.billingBrGstNum,
      billingBrAddress : this.billingBrAddress,
      billingBrLocation : this.billingBrLocation,
      billingBrCity : this.billingBrCity,
      billingBrState : this.billingBrState,
      billingBrPincode : this.billingBrPincode,
      msaId  : (typeof this.alliedBillVal.msaId === 'undefined') ? 0 : this.alliedBillVal.msaId,
      msaCode  : (typeof this.alliedBillVal.msaCode === 'undefined') ? "" : this.alliedBillVal.msaCode,
      sfxId  : (typeof this.alliedBillVal.sfxId === 'undefined') ? 0 : this.alliedBillVal.sfxId,
      sfxCode  : (typeof this.alliedBillVal.sfxCode === 'undefined') ? "" : this.alliedBillVal.sfxCode,
      rateCardId  : (typeof this.alliedBillVal.rateCardId === 'undefined') ? 0 : this.alliedBillVal.rateCardId,
      rateCardCode  : (typeof this.alliedBillVal.rateCardCode === 'undefined') ? "" : this.alliedBillVal.rateCardCode,
     
      alliedLines: this.dataSource.data};
    console.log('Creating Allied Bill',this.alliedBillReq);
    this._spinner.show();
    this._alliedservice.postAlliedBill(this.alliedBillReq).then((resp) => {
      console.log(resp);
      this._spinner.hide();
      const dialogRef = this._dialogs.open(ConfirmationSuccessDialogComponent, {​​​​​​​​
        data: {​​​​​​​​value: resp.body, message: 'Allied bill created successfully.' }​​​​​​​​,
        disableClose: true
      }​​​​​​​​);
      this.displayResultComponentChange.emit("saved");
      dialogRef.afterClosed().subscribe((res) => {
        if(res) {
          this._router.navigate(['/dashboard']);
        }
      });  
    }).catch((error)=> {
      console.log('ERRORS');
      console.log(error);
      this._spinner.hide();
      // if (error.error != null) {
      //   if (error.error.errorCode === 'handled_exception') {
      //     this._toastr.error((error.error.errorMessage));
      //   } else {
      //     this._toastr.error(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
      //   }
      // } else {
      //   this._toastr.error(error.message);
      // }
      this.handleStringError(error);
    });    
    // }
    
  }

  addNewLine() {
    // if (typeof this.alliedBillVal.gstin === 'undefined' || this.alliedBillVal.gstin === ""){
    //   this._toastr.error("No Customer GST Number Found.");
    // }else if (typeof this.billStateCode === 'undefined' || this.billStateCode === ""){
    //   this._toastr.error("No Company GST Number Found.");
    // }else{
      this.dataSource.data.push({
        lineNumber: this.dataSource.data.length + 1,
        waybill: null,
        waybillId : null,
        reason: null,
        amount: null,
        
        remarks: null,
        sgst: 0,
        cgst: 0,
        igst: 0,
        total: 0,
        totalTaxAmount: 0,
        reasonId : 0
      });
      this.dataSource = new MatTableDataSource(this.dataSource.data);
    //}
    
  }

  addNewLineWithWaybillNum(waybillNum:string) {
    this.dataSource.data.unshift({
      lineNumber: this.dataSource.data.length + 1,
      waybill: waybillNum,
      reason: null,
      amount: null,
      remarks: null,
      sgst: 0,
      cgst: 0,
      igst: 0,
      total: 0,
      totalTaxAmount: 0,
      reasonId : 0,
      waybillId : 0
    });
    this.dataSource = new MatTableDataSource(this.dataSource.data);
  }

  getIgstTotal() {
    return this.dataSource.data.map(t => t.igst).reduce((acc, value) => acc + value, 0);
  }

  getSgstTotal() {
    return this.dataSource.data.map(t => t.sgst).reduce((acc, value) => acc + value, 0);
  }

  getCgstTotal() {
    return this.dataSource.data.map(t => t.cgst).reduce((acc, value) => acc + value, 0);
  }

  getTaxTotal() {
    return this.getIgstTotal() + this.getSgstTotal() + this.getCgstTotal();
  }

  getLineTotal() {
    return this.dataSource.data.map(t => t.amount).reduce((acc, value) => acc + value, 0);
  }

  getFinTotal() {
    return this.getIgstTotal() + this.getSgstTotal() + this.getCgstTotal() + this.getLineTotal();
  }

  private getReasonsList(){
    this._spinner.show();
    this._lookupService.getLookupValuesByType('ALLIED_LINES_RSN').subscribe(
    response => {
      this.billReasonsList = [];
      response.data.forEach(
        lkps => {
          this.billReasonsList = [...this.billReasonsList, { reasonId: lkps.id, reasonValue: lkps.descr }];

        });
        
      this._spinner.hide();
    },
    error => {
      this._spinner.hide();
    });
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

  setReasonAndId(index,selectedReason){
    let tempAlliedline = this.dataSource.data[index];
    tempAlliedline.reasonId = selectedReason.reasonId;
    this.dataSource.data[index] = tempAlliedline;
  }

  getBranchGstNumber(){
    console.log('inside branch');
    //User Branch API call for GST NUM
    this._lookupService.getBranchData(this.alliedBillVal.billingBranchId).subscribe(
      response => {
        console.log(response.data);
        this.billStateCode = response.data.branchGstNum;
        this.billingBrGstNum = (typeof response.data.branchGstNum === 'undefined') ? "" : response.data.branchGstNum;
        this.billingBrAddress = response.data.address;
        //this.billingBrLocation = response.data.
        //this.billingBrCity = response.data.
        //this.billingBrState = response.data.
        //this.billingBrPincode = response.data.
        
        
    },
    error => {
      this._spinner.hide();
      this._toastr.warning((error.message));
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
