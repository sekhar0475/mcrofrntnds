import { Component, Input, ViewChild, ChangeDetectorRef, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { CmdmService } from '../../services/cmdm.service';
import { CMDMSearchParam } from '../../models/CMDMSearchParam';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { CMDMSearchResultLine } from '../../models/CMDMSearchResultLine';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CMDMBillModelRequest } from '../../models/CMDMBillModelRequest';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookUpResponse } from '../../models/LookUpResponse';
import { BillDetailResponse } from '../../models/BillDetailModels';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { WaybillModel } from '../../models/WaybillSearchModels';
import { throwError } from 'rxjs';
import { ExportToExcelService } from 'src/app/shared/services/export-to-excel-service/export-to-excel.service';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { BranchDataModel } from '../../models/branch-data-model';
import { ConfirmationSuccessDialogComponent } from 'src/app/shared/components/confirmation-success-dialog/confirmation-success-dialog.component';


@Component({
  selector: 'app-cmdm-search-result',
  templateUrl: './cmdm-search-result.component.html',
  styleUrls: ['./cmdm-search-result.component.scss']
})
export class CmdmSearchResultComponent implements OnChanges {

  ifErrored = false;
  oracleTaxRateCode: string;
  billBranchId; 
  billingLevelCode; 
  billingLevel; 
  custMsaId;
  billToCustName; 
  billingLevelId;
  alliedWaybillType;

  branchDetail: BranchDataModel;
  totalLineAmount: number;
  numberOfDocsSearched = 0;
  numberOfWaybillsSearched = 0;
  errorMessage: ErrorMsg;
  reasonLineList: LookUpResponse[];
  gstNum: string;
  billToAddr: string;
  billToCity: string;
  billToState: string;
  billToAddrLine1: string;
  billToAddrLine2: string;
  billToAddrLine3: string;
  billToLocation: string;
  billToPincode: string;
  blngBrAddr: string;
  blngBrCity: string;
  blngBrLocation: string;
  blngBrState: string;
  ebillFlag: string;
  email: string;
  custMsaCode: string;
  sfxCode: string;
  rateCardCode: string;
  blngBrGst: string;
  alliedBillType: string;

  @Input() cmdmSearchParam: CMDMSearchParam;
  @Output('emitterClearSearchParams') clearSearchParams = new EventEmitter<boolean>(false);

  dataSource: MatTableDataSource<CMDMSearchResultLine> = new MatTableDataSource();
  excelDatatable: MatTableDataSource<CMDMSearchResultLine>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['lineNumber', 'billNumber', 'billDt', 'outstandingAmt', 'actualoutstandingAmt', 'collBr', 'reason', 'amount', 'remark', 'taxableAmount', 'sgst', 'cgst', 'igst'];
  displayedColumnsTotal: string[] = ['total', 'totalAmount', 'totalTaxableAmount', 'totalSgst', 'totalCgst', 'totalIgst'];
  displayedColumnsGTotal: string[] = ['gTotal', 'gTotalAmount'];

  cmdmBillModelRequest: CMDMBillModelRequest;

  constructor(
    private _dialog: MatDialog,
    public _toastr: ToastrService,
    private _cd: ChangeDetectorRef,
    private _cmdmService: CmdmService,
    private _spinner: NgxSpinnerService,
    private _exportToService: ExportToExcelService,
    private _tokenStorageService: TokenStorageService) { }

  setup() {
    this.getLineReasons();
    this.billBranchId = this._tokenStorageService.getUserBranch();
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.displayedColumns = ['lineNumber', 'billNumber', 'billDt', 'actualoutstandingAmt', 'outstandingAmt', 'collBr', 'reason', 'amount', 'remark', 'taxableAmount', 'sgst', 'cgst', 'igst'];
    this.displayedColumnsTotal = ['total', 'totalAmount', 'totalTaxableAmount', 'totalSgst', 'totalCgst', 'totalIgst'];
    this.displayedColumnsGTotal = ['gTotal', 'gTotalAmount'];
    if (this.cmdmSearchParam.isWaybill) {
      this.displayedColumns = ['lineNumber', 'billNumber', 'waybillNumber', 'billDt', 'actualoutstandingAmt', 'outstandingAmt',
        'reason', 'amount', 'remark', 'taxableAmount', 'sgst', 'cgst', 'igst'];
      this.displayedColumnsTotal = ['total', 'totalAmount', 'totalTaxableAmount', 'totalSgst', 'totalCgst', 'totalIgst'];
      this.displayedColumnsGTotal = ['gTotal', 'gTotalAmount'];
    }
    if (this.cmdmSearchParam.isBulkUpload) {
      this.displayedColumns = ['lineNumber', 'billNumber', 'waybillNumber', 'billDt', 'actualoutstandingAmt', 'wayBillReason'
        , 'amount', 'remark', 'message', 'taxableAmount', 'sgst', 'cgst', 'igst'];
      this.displayedColumnsTotal = ['total', 'totalAmount', 'totalTaxableAmount', 'totalSgst', 'totalCgst', 'totalIgst'];
      this.displayedColumnsGTotal = ['gTotal', 'gTotalAmount'];
    }
    this.search();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.cmdmSearchParam);
    console.log('document wise', this.cmdmSearchParam.documentWise);
    this.setup();
  }

  // lookups
  getLineReasons() {
    //this._spinner.show();
    if (this.cmdmSearchParam.isCreditNote) {
      this._cmdmService.getCMLineReason().subscribe((res) => {
        this.reasonLineList = res['data'];
        console.log(this.reasonLineList);
        // this._spinner.hide();
      }, (err) => {
        this.handleError(err);
        // this._spinner.hide();
      });
    } else {
      this._cmdmService.getDMLineReason().subscribe((res) => {
        this.reasonLineList = res['data'];
        console.log(this.reasonLineList);
        //  this._spinner.hide();
      }, (err) => {
        this.handleError(err);
        // this._spinner.hide();
      });
    }
  }

  createCMDMBill() {
    this.buildCMDMBillModelRequest();
    return this.validateCMDMBillRequestThenPost();
  }

  validateCMDMBillRequestThenPost() {
    try {
      if (this.cmdmSearchParam.isCreditNote) {
        let billsGroupedList = {} as CMDMSearchResultLine[];
        if (this.cmdmSearchParam.isWaybill) {
          billsGroupedList = this.getGroupedByBillNumberLineAmt();
          console.log('billsGroupedList', billsGroupedList);
        }
        if (this.cmdmBillModelRequest.documentSubType === 'credit' ||
          this.cmdmBillModelRequest.documentSubType === 'wms' ||
          this.cmdmBillModelRequest.documentSubType === 'allied') {
          if (null == this.cmdmBillModelRequest.billingLevel ||
            null == this.cmdmBillModelRequest.billingLevelCode) {
            this._toastr.warning('Billing Level and Billing level Code for the Invoice is Mandatory.');
          }
        }

        this.cmdmBillModelRequest.cmdmBillLines.forEach((cmdmBillLine) => {
          const outstandingAmount: number = cmdmBillLine.outstandingAmt;


          let lineAmt: number = cmdmBillLine.lineAmt;

          if (this.cmdmSearchParam.isWaybill) {
            billsGroupedList.forEach((cmdmBillLineGrouped) => {
              if (cmdmBillLine.billNumber === cmdmBillLineGrouped.billNumber) {
                if (Number(cmdmBillLineGrouped.totalLineAmtGrouped.toFixed(2)) > Number(cmdmBillLine.actInvOutstandingAmt)) {
                  console.log("Number(cmdmBillLineGrouped.totalLineAmtGrouped.toFixed(2))", Number(cmdmBillLineGrouped.totalLineAmtGrouped.toFixed(2)));
                  console.log("Number(cmdmBillLine.actInvOutstandingAmt)", Number(cmdmBillLine.actInvOutstandingAmt));
                  this._toastr.warning('Grouped sum of amount is greater than bill outstanding amount : ' + cmdmBillLine.billNumber);
                }
              }
            });
          }

          if (lineAmt < 0) {
            lineAmt = (-1) * lineAmt;
          } else {
            cmdmBillLine.lineAmt = (-1) * cmdmBillLine.lineAmt;
          }
          if (lineAmt > outstandingAmount) {
            this._toastr.warning('Amount Entered is Greater Than Outstanding Amount: Bill Actual Amount is = ' + outstandingAmount);
          }
          if (lineAmt <= 0) {
            this._toastr.warning('CM/DM Bill Amount Should Greater Than 0');
          }
          if (outstandingAmount == null) {
            this._toastr.warning('Outstanding Amount of Bill is null');
          }
          if (cmdmBillLine.reasonId == null) {
            this._toastr.warning('Reason is Mandatory for CM/DM Bill Creation');
          }


          cmdmBillLine.reason = this.getReasonById(cmdmBillLine.reasonId);
        });
      } else {
        // for debit memo.
        this.cmdmBillModelRequest.cmdmBillLines.forEach((cmdmBillLine) => {
          const outstandingAmount: number = cmdmBillLine.outstandingAmt;
          let lineAmt: number = cmdmBillLine.lineAmt;

          if (lineAmt > outstandingAmount) {
            this._toastr.warning('Amount Entered is Greater Than Outstanding Amount: Bill Actual Amount is = ' + outstandingAmount);
          }
          if (lineAmt <= 0) {
            this._toastr.warning('CM/DM Bill Amount Should Greater Than 0');
          }
          if (outstandingAmount == null) {
            this._toastr.warning('Outstanding Amount of Bill is null');
          }
          if (cmdmBillLine.reasonId == null) {
            this._toastr.warning('Reason is Mandatory for CM/DM Bill Creation');
          }
          cmdmBillLine.reason = this.getReasonById(cmdmBillLine.reasonId);
        });
      }
      if (!this._toastr.currentlyActive) {
        console.log('Before submit ', this.cmdmBillModelRequest);
        return this._cmdmService.postCMDMBill(this.cmdmBillModelRequest, this.cmdmSearchParam.documentSubType);
      } else {
        this._spinner.hide();
      }
    } catch (err) {
      this._spinner.hide();
      return throwError(err);
    }
  }

  getReasonById(reasonId) {
    let reason = null;
    this.reasonLineList.forEach((lookup) => {
      if (lookup.id === reasonId) {
        reason = lookup.lookupVal;
      }
    });
    return reason;
  }

  getGroupedByBillNumberLineAmt() {

    let cmdmLinesGroup = {} as CMDMSearchResultLine[];

    cmdmLinesGroup = this.cmdmBillModelRequest.cmdmBillLines;

    return cmdmLinesGroup.reduce((total, val) => {
      const foundBillIndex = total.findIndex((obj) => obj.billNumber === val.billNumber);
      console.log("foundBillIndex", foundBillIndex);
      if (foundBillIndex < 0) {
        val.totalLineAmtGrouped =val.lineAmt;
        total.push(val);
        console.log('Came inside push total amount');
      } else {
        console.log("before ", total[foundBillIndex].totalLineAmtGrouped);
        total[foundBillIndex].totalLineAmtGrouped += val.lineAmt;
        console.log("after ", total[foundBillIndex].totalLineAmtGrouped);
      }
      console.log("total waybill grouped", total);
      return total;
    }, []);
  }

  forceReset() {
    console.log('Force reset: STARTED');
    // this.deleteAllLines();
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

  submit() {
    if (!this._toastr.currentlyActive) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Please confirm if you want to continue with cmdm bill creation?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this._spinner.show();
          this.createCMDMBill().subscribe((res) => {
            if (res.status === 200) {
              this._spinner.hide();
              this.forceReset();
              // this._toastr.success('CD/DM Bill creation initiated successfully with Bill Number: ' + res.body);
              const successDialogRef = this._dialog.open(ConfirmationSuccessDialogComponent, {
                data: { value: res.body, message: 'Credit Note/Debit Note Bill creation initiated' },
                disableClose: true
              });
              successDialogRef.afterClosed().subscribe((res) => {
                if (res) {
                  successDialogRef.close();
                  // this._router.navigate(['/dashboard']);
                }
              });

            } else {
              this._spinner.hide();
              throw new Error('Unable to create Credit / Debit Memo.');
            }
          }, (err) => {
            this._toastr.error('Unable to create Credit / Debit Memo.');
            this.handleStringError(err);
            this._spinner.hide();
          });
        }
      });
    }
  }

  coundNumberOfDocsSearched() {
    if (!this.checkEmpty(this.cmdmSearchParam.documentNumbers)) {
      this.numberOfDocsSearched = this.cmdmSearchParam.documentNumbers.split(',').length;
    }
    if (!this.checkEmpty(this.cmdmSearchParam.waybillNumbers)) {
      console.log('coundNumberOfDocsSearched waybill search');
      this.numberOfWaybillsSearched = this.cmdmSearchParam.waybillNumbers.split(',').length;
    }
  }

  search() {
    if (this.cmdmSearchParam.isBulkUpload) {
      this.uploadValidateAndShow();
    } else {
      this.coundNumberOfDocsSearched();
      this.getBillsByDocumentNumberOrWaybillNumber();
    }
  }

  uploadValidateAndShow() {
    this._spinner.show();
    this._cmdmService.uploadAndValidate(this.cmdmSearchParam.selectedFile, this.cmdmSearchParam.documentSubType,
      this.cmdmSearchParam.documentNumbers, this.cmdmSearchParam.isCreditNote.toString()).subscribe((res) => {
        if (res.status === 200) {
          this.dataSource.data = res.body.cmdmBillLines;
          const bills = res.body;

          this.custMsaId = bills.custId;
          this.billingLevel = bills.billingLevel;
          this.billingLevelCode = bills.billingLevelCode;
          this.billToCustName = bills.customerName;
          this.cmdmSearchParam.billBranch = bills.cmdmBillLines[0].collBr;
          this.cmdmSearchParam.documentNumbers = bills.cmdmBillLines[0].billNumber;
          this.gstNum = bills.gstNum;
          this.billToAddr = bills.billToAddr;
          this.billToCity = bills.billToCity;
          this.billToState = bills.billToState;
          this.billToAddrLine1 = bills.billToAddrLine1;
          this.billToAddrLine1 = bills.billToAddrLine1;
          this.billToAddrLine1 = bills.billToAddrLine1;
          this.billToLocation = bills.billToLocation;
          this.billToPincode = bills.billToPincode;
          this.blngBrAddr = bills.blngBrAddr;
          this.blngBrCity = bills.blngBrCity;
          this.blngBrLocation = bills.blngBrLocation;
          this.blngBrState = bills.blngBrState;
          this.ebillFlag = bills.ebillFlag;
          this.email = bills.email;
          this.custMsaCode = bills.custMsaCode;
          this.sfxCode = bills.sfxCode;
          this.rateCardCode = bills.rateCardCode;
          this.blngBrGst = bills.blngBrGst;
          this.billingLevelId = bills.billingLevelId;
          if (null != res.body.errorMessage) {
            this._toastr.warning(res.body.errorMessage);
            this.ifErrored = true;
          } else {
            this.ifErrored = false;
          }
          this.dataSource.paginator = this.paginator;
        }
        this._spinner.hide();
        this.cmdmSearchParam.fileInput.nativeElement.value = '';
      }, (err) => {
        this._spinner.hide();
        this.handleError(err);
        this.ifErrored = true;
        this.cmdmSearchParam.fileInput.nativeElement.value = '';
      });
  }

  getBillsByDocumentNumberOrWaybillNumber() {
    this.getBillsBasedOnDocumentSubType(this.cmdmSearchParam.documentSubType);
  }

  checkEmpty(x) {
    return (x === undefined || x === null || x === '');
  }

  // data based on sub document type
  getBillsBasedOnDocumentSubType(documentSubType: string) {
    this._spinner.show();
    switch (documentSubType) {
      case 'credit': {
        this.creditDataForCMDM();
        break;
      }
      case 'retail': {
        if ('WAYBILL' === this.cmdmSearchParam.documentWise && ('Waybill' === this.cmdmSearchParam.createdAgainst)) {
          this.retailWaybillDataForCMDM();
          break;
        } else {
          this.retailBillDataForCMDM();
          break;
        }
      }
      case 'wms': {
        this.wmsDataForCMDM();
        break;
      }
      case 'allied': {
        this.alliedDataForCMDM();
        break;
      }
      default: {
        break;
      }
    }
  }

  // credit
  creditDataForCMDM() {
    this._cmdmService.getCreditBillsByDocumentNumber(this.cmdmSearchParam.documentNumbers,
      this.cmdmSearchParam.documentWise).subscribe((res) => {
        if (res.status === 200) {
          const bills: BillDetailResponse[] = res.body;
          if (bills.length <= 0) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else if (this.numberOfDocsSearched > bills.length) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else {
            this.custMsaId = bills[0].custMsaId;
            this.billingLevel = bills[0].billingLevel;
            this.billingLevelCode = bills[0].billingLevelCode;
            this.billToCustName = bills[0].billToCustName;
            this.cmdmSearchParam.billBranch = bills[0].collBr;
            this.gstNum = bills[0].gstNum;
            this.billToAddr = bills[0].billToAddr;
            this.billToCity = bills[0].billToCity;
            this.billToState = bills[0].billToState;
            this.billToAddrLine1 = bills[0].billToAddrLine1;
            this.billToAddrLine2 = bills[0].billToAddrLine2;
            this.billToAddrLine3 = bills[0].billToAddrLine3;
            this.billToLocation = bills[0].billToLocation;
            this.billToPincode = bills[0].billToPincode;
            this.blngBrAddr = bills[0].blngBrAddr;
            this.blngBrCity = bills[0].blngBrCity;
            this.blngBrLocation = bills[0].blngBrLocation;
            this.blngBrState = bills[0].blngBrState;
            this.ebillFlag = bills[0].ebillFlag;
            this.email = bills[0].email;
            this.custMsaCode = bills[0].custMsaCode;
            this.sfxCode = bills[0].sfxCode;
            this.rateCardCode = bills[0].rateCardCode;
            this.blngBrGst = bills[0].blngBrGst;
            this.billingLevelId = bills[0].billingLevelId;
            bills.forEach(bill => {
            
              console.log(this.cmdmSearchParam.documentWise);
              if ('WAYBILL' === this.cmdmSearchParam.documentWise) {
                bill.waybills.forEach(waybill => {
                  let wayBillOutstandingAmtToNum: number = +waybill.outstandingAmount; //converting it to number
                  let wayBillroundedOffoutstandingAmt: string = wayBillOutstandingAmtToNum.toFixed(2);//rounding off the number 

                  let OutstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
                  let roundedOffoutstandingAmt: string = OutstandingAmtToNum.toFixed(2);//rounding off the number 

                  this.addNewCMDMLineInTable(bill.billId, bill.billType, bill.billNum, waybill.waybillId,
                    waybill.waybillNum, waybill.amount, wayBillroundedOffoutstandingAmt, bill.oracleArTrasactionId,
                    bill.oracleTaxRateCode, bill.oracleTaxRate, bill.billToAddr, bill.billToAddressId,
                    bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                    bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, null, roundedOffoutstandingAmt);
                });
              } else {
                //rounding of outstanding amount to two decimal places
                let outstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
                let roundedOffoutstandingAmt: string = outstandingAmtToNum.toFixed(2);//rounding off the number

                //rounding of actual outstanding amount to two decimal places
                let actualOutstandingAmtToNum: number = +bill.actualoutstandingAmt; //converting it to number
                let roundedOffActualOutstandingAmt: string = actualOutstandingAmtToNum.toFixed(2);//rounding off the number

                this.addNewCMDMLineInTable(bill.billId, bill.billType, bill.billNum, null, null, bill.actualoutstandingAmt,
                  roundedOffoutstandingAmt, bill.oracleArTrasactionId, bill.oracleTaxRateCode,
                  bill.oracleTaxRate, bill.billToAddr, bill.billToAddressId,
                  bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                  bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, null, roundedOffActualOutstandingAmt);
              }
            });
            this.dataSource.paginator = this.paginator;
          }
          this._spinner.hide();
          this.ifErrored = false;
        }
      }, (err) => {
        this.handleError(err);
        this._spinner.hide();
        this.ifErrored = true;
      });
  }

  // wms
  wmsDataForCMDM() {
    this._cmdmService.getWMSBillsBy(this.cmdmSearchParam.documentNumbers, true).subscribe((res) => {
      if (res.status === 200) {
        const bills: BillDetailResponse[] = res.body;

        if (bills.length <= 0) {
          this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
        } else if (this.numberOfDocsSearched > bills.length) {
          this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
        } else {

          console.log('bills ', bills);

          this.custMsaId = bills[0].custMsaId;
          this.billingLevel = bills[0].billingLevel;
          this.billingLevelCode = bills[0].billingLevelCode;
          this.cmdmSearchParam.billBranch = bills[0].collBr;
          this.billToCustName = bills[0].billToCustName;
          this.gstNum = bills[0].gstNum;
          this.billToAddr = bills[0].billToAddr;
          this.billToCity = bills[0].billToCity;
          this.billToState = bills[0].billToState;
          this.billToAddrLine1 = bills[0].billToAddrLine1;
          this.billToAddrLine1 = bills[0].billToAddrLine1;
          this.billToAddrLine1 = bills[0].billToAddrLine1;
          this.billToLocation = bills[0].billToLocation;
          this.billToPincode = bills[0].billToPincode;
          this.blngBrAddr = bills[0].blngBrAddr;
          this.blngBrCity = bills[0].blngBrCity;
          this.blngBrLocation = bills[0].blngBrLocation;
          this.blngBrState = bills[0].blngBrState;
          this.ebillFlag = bills[0].ebillFlag;
          this.email = bills[0].email;
          this.custMsaCode = bills[0].custMsaCode;
          this.sfxCode = bills[0].sfxCode;
          this.rateCardCode = bills[0].rateCardCode;
          this.blngBrGst = bills[0].blngBrGst;
          this.billingLevelId = bills[0].billingLevelId;
          bills.forEach(bill => {
             //rounding of outstanding amount to two decimal places
             let outstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
             let roundedOffoutstandingAmt: string = outstandingAmtToNum.toFixed(2);//rounding off the number

             //rounding of actual outstanding amount to two decimal places
             let actualOutstandingAmtToNum: number = +bill.actualoutstandingAmt; //converting it to number
             let roundedOffActualOutstandingAmt: string = actualOutstandingAmtToNum.toFixed(2);//rounding off the numbe

            this.addNewCMDMLineInTable(bill.billId, bill.billType, bill.billNum, null, null, bill.actualoutstandingAmt,
              roundedOffoutstandingAmt, bill.oracleArTrasactionId, bill.oracleTaxRateCode, bill.oracleTaxRate,
              bill.billToAddr, bill.billToAddressId, bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr
              , bill.collBrId, bill.altCollBrId, bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, null, roundedOffActualOutstandingAmt);
          });
          this.dataSource.paginator = this.paginator;
        }
        this._spinner.hide();
        this.ifErrored = false;
      }
    }, (err) => {
      this.handleError(err);
      this._spinner.hide();
      this.ifErrored = true;
    });
  }

  // allied
  alliedDataForCMDM() {
    this._cmdmService.getAlliedBillsBy(this.cmdmSearchParam.documentNumbers,
      this.cmdmSearchParam.documentWise, true).subscribe((res) => {
        if (res.status === 200) {
          const bills: BillDetailResponse[] = res.body;
          if (bills.length <= 0) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else if (this.numberOfDocsSearched > bills.length) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else {
            this.custMsaId = bills[0].custMsaId;
            this.billingLevel = bills[0].billingLevel;
            this.billingLevelCode = bills[0].billingLevelCode;
            this.cmdmSearchParam.billBranch = bills[0].collBr;
            this.billToCustName = bills[0].billToCustName;
            this.gstNum = bills[0].gstNum;
            this.billToAddr = bills[0].billToAddr;
            this.billToCity = bills[0].billToCity;
            this.billToState = bills[0].billToState;
            this.billToAddrLine1 = bills[0].billToAddrLine1;
            this.billToAddrLine2 = bills[0].billToAddrLine2;
            this.billToAddrLine3 = bills[0].billToAddrLine3;
            this.billToLocation = bills[0].billToLocation;
            this.billToPincode = bills[0].billToPincode;
            this.blngBrAddr = bills[0].blngBrAddr;
            this.blngBrCity = bills[0].blngBrCity;
            this.blngBrLocation = bills[0].blngBrLocation;
            this.blngBrState = bills[0].blngBrState;
            this.ebillFlag = bills[0].ebillFlag;
            this.email = bills[0].email;
            this.custMsaCode = bills[0].custMsaCode;
            this.sfxCode = bills[0].sfxCode;
            this.rateCardCode = bills[0].rateCardCode;
            this.blngBrGst = bills[0].blngBrGst;
            this.billingLevelId = bills[0].billingLevelId;
            this.alliedBillType = bills[0].billType;
            this.alliedWaybillType = bills[0].paidToPayStatus
            bills.forEach(bill => {

              console.log(this.cmdmSearchParam.documentWise);
              if ('WAYBILL' === this.cmdmSearchParam.documentWise) {
                bill.waybills.forEach(waybill => {
                  this.addNewCMDMLineInTable(bill.billId, bill.billType, bill.billNum, waybill.billId, waybill.billNum,
                    waybill.outstandingAmount, waybill.outstandingAmount, bill.oracleArTrasactionId,
                    bill.oracleTaxRateCode, bill.oracleTaxRate, bill.billToAddr, bill.billToAddressId,
                    bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                    bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, null, bill.outstandingAmt);
                });
              } else {
                   //rounding of outstanding amount to two decimal places
                  let outstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
                  let roundedOffoutstandingAmt: string = outstandingAmtToNum.toFixed(2);//rounding off the number

                  //rounding of actual outstanding amount to two decimal places
                  let actualOutstandingAmtToNum: number = +bill.actualoutstandingAmt; //converting it to number
                  let roundedOffActualOutstandingAmt: string = actualOutstandingAmtToNum.toFixed(2);//rounding off the numbe

                  this.addNewCMDMLineInTable(bill.billId, bill.billType, bill.billNum, null, null, bill.actualoutstandingAmt,
                  roundedOffoutstandingAmt, bill.oracleArTrasactionId, bill.oracleTaxRateCode,
                  bill.oracleTaxRate, bill.billToAddr, bill.billToAddressId, bill.billDt, bill.bkgBrId,
                  bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                  bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, bill.paidToPayStatus , roundedOffActualOutstandingAmt);
              }
            });
            this.dataSource.paginator = this.paginator;
          }
          this._spinner.hide();
          this.ifErrored = false;
        }
      }, (err) => {
        this.handleError(err);
        this._spinner.hide();
        this.ifErrored = true;
      });
  }

  // retail bill
  retailBillDataForCMDM() {
    this._cmdmService.getRetailBillsByDocumentNumber(this.cmdmSearchParam.documentNumbers,
      this.cmdmSearchParam.documentWise).subscribe((res) => {
        if (res.status === 200) {
          const bills: BillDetailResponse[] = res.body;
          if (bills.length <= 0) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else if (this.numberOfDocsSearched > bills.length) {
            this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
          } else {


            this.custMsaId = bills[0].custMsaId;
            this.billingLevel = bills[0].billingLevel;
            this.billingLevelCode = bills[0].billingLevelCode;
            this.cmdmSearchParam.billBranch = bills[0].collBr;
            this.billToCustName = bills[0].billToCustName;
            this.gstNum = bills[0].gstNum;
            this.billToAddr = bills[0].billToAddr;
            this.billToCity = bills[0].billToCity;
            this.billToState = bills[0].billToState;
            this.billToAddrLine1 = bills[0].billToAddrLine1;
            this.billToAddrLine2 = bills[0].billToAddrLine2;
            this.billToAddrLine3 = bills[0].billToAddrLine3;
            this.billToLocation = bills[0].billToLocation;
            this.billToPincode = bills[0].billToPincode;
            this.blngBrAddr = bills[0].blngBrAddr;
            this.blngBrCity = bills[0].blngBrCity;
            this.blngBrLocation = bills[0].blngBrLocation;
            this.blngBrState = bills[0].blngBrState;
            this.billingLevelId = bills[0].billingLevelId;

            bills.forEach(bill => {
              let waybillType;
              if ('PAID' === bill.billType) {
                waybillType = 'PAID_WAYBILL';
              } else if ('TO-PAY' === bill.billType) {
                waybillType = 'TOPAY_WAYBILL';
              }
              if ('WAYBILL' === this.cmdmSearchParam.documentWise) {
                let trimmedWaybills = [];
                let waybillNumbers = [];
                if (this.cmdmSearchParam.waybillNumbers != null) {
                  waybillNumbers = this.cmdmSearchParam.waybillNumbers.trim().split(',');

                }

                waybillNumbers.forEach((w) => {
                  trimmedWaybills.push(w.trim());
                });

                console.log('trimmedWaybills[0]', trimmedWaybills[0]);
                bill.waybills.forEach(waybill => {
                  if ((trimmedWaybills[0] == '') || trimmedWaybills.includes(waybill.waybillNum.toString(), 0)) {
                    let wayBillOutstandingAmtToNum: number = +waybill.outstandingAmount; //converting it to number
                  let wayBillroundedOffoutstandingAmt: string = wayBillOutstandingAmtToNum.toFixed(2);//rounding off the number 

                  let OutstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
                  let roundedOffoutstandingAmt: string = OutstandingAmtToNum.toFixed(2);//rounding off the number 
                  
                    this.addNewCMDMLineInTable(bill.billId, this.cmdmSearchParam.createdAgainst === 'Waybill' ? 'REATIL_' + waybillType : 'RETAIL_BILL', bill.billNum, waybill.waybillId,
                      waybill.waybillNum, waybill.amount, wayBillroundedOffoutstandingAmt, bill.oracleArTrasactionId,
                      bill.oracleTaxRateCode, bill.oracleTaxRate, bill.billToAddr, bill.billToAddressId,
                      bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                      bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, bill.billType==='TO-PAY'?'TOPAY':bill.billType, roundedOffoutstandingAmt);
                  }
                });

              } else {
                 //rounding of outstanding amount to two decimal places
                 let outstandingAmtToNum: number = +bill.outstandingAmt; //converting it to number
                 let roundedOffoutstandingAmt: string = outstandingAmtToNum.toFixed(2);//rounding off the number
 
                 //rounding of actual outstanding amount to two decimal places
                 let actualOutstandingAmtToNum: number = +bill.actualoutstandingAmt; //converting it to number
                 let roundedOffActualOutstandingAmt: string = actualOutstandingAmtToNum.toFixed(2);//rounding off the number
                this.addNewCMDMLineInTable(bill.billId, 'RETAIL_BILL', bill.billNum, null, null, bill.actualoutstandingAmt,
                  roundedOffoutstandingAmt, bill.oracleArTrasactionId, bill.oracleTaxRateCode, bill.oracleTaxRate, bill.billToAddr,
                  bill.billToAddressId, bill.billDt, bill.bkgBrId, bill.bkgBrId, bill.collBr, bill.collBrId, bill.altCollBrId,
                  bill.altCollBr, bill.submsnBrId, bill.submsnBr, bill.blngBrId, bill.blngBr, 'TO-PAY' === bill.billType?'TOPAY':bill.billType, roundedOffoutstandingAmt);
              }
            });
            this.dataSource.paginator = this.paginator;
          }
          this._spinner.hide();
          this.ifErrored = false;
        }
      }, (err) => {
        this.handleError(err);
        this._spinner.hide();
        this.ifErrored = true;
      });
  }

  // retail waybill
  retailWaybillDataForCMDM() {
    let documentType = null;
    let billType = null
    this._cmdmService.getWaybillsDetails(this.cmdmSearchParam.waybillNumbers).subscribe((res) => {
      if (res.status === 200) {
        const bills: WaybillModel[] = res.body;
        if (bills.length <= 0) {
          this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
        } else if (this.numberOfWaybillsSearched > bills.length) {
          this._toastr.info('Searched Bills/Documents not found or they are not of same Billing Level');
        } else {
          this.custMsaId = bills[0].consignerId;
          this.billToCustName = bills[0].billToCustomer;
          this.gstNum = bills[0].gstNum;
          this.billToAddr = bills[0].billToAddr;
          this.billToCity = bills[0].city;
          this.billToState = bills[0].state;
          this.billToAddrLine1 = bills[0].billToAddr;
          this.billToAddrLine2 = null;
          this.billToAddrLine3 = null;
          this.billToLocation = bills[0].billToLocation;
          this.billToPincode = bills[0].billToPincode;
          this.blngBrAddr = bills[0].billToAddr;
          this.blngBrCity = bills[0].billToLocation;
          this.blngBrLocation = bills[0].billToLocation;
          this.blngBrState = bills[0].state;
          this.ebillFlag = null;
          this.email = bills[0].billToEmail;
          this.custMsaCode = bills[0].prcCode;
          this.sfxCode = null;
          this.rateCardCode = null;
          if (this.cmdmSearchParam.documentSubType === 'retail') {
            // if (this.cmdmSearchParam.documentType === 'CREDIT_NOTE') {
            //   billType = '_CM_BILL';
            // } else {
            //   billType = '_DM_BILL';
            // }
            documentType = 'RETAIL_';
          }
          bills.forEach(waybill => {
            if ('PAID' === waybill.documentType) {
              this.cmdmSearchParam.billBranch = bills[0].bkgBr;
              this.getBranchGstByBranchId(bills[0].bkgBrId, bills[0].bkgBr, waybill, waybill.pickupDate, waybill.documentType, documentType+'PAID_WAYBILL');
            } else if ('TO-PAY' === waybill.documentType) {
              this.cmdmSearchParam.billBranch = bills[0].deliveryBr;
              this.getBranchGstByBranchId(bills[0].deliveryBrId, bills[0].deliveryBr, waybill, waybill.delieveryDate, waybill.documentType, documentType+'TOPAY_WAYBILL');
            }
          });
          this.dataSource.paginator = this.paginator;
        }
        this._spinner.hide();
        this.ifErrored = false;
      }
    }, (err) => {
      this.handleError(err);
      this._spinner.hide();
      this.ifErrored = true;
    });
  }

  buildCMDMBillModelRequest() {
    this.cmdmBillModelRequest = {} as CMDMBillModelRequest;

    if (this.cmdmSearchParam.documentType === 'CREDIT_NOTE') {
      this.cmdmBillModelRequest.billType = '_CM_BILL';
    } else {
      this.cmdmBillModelRequest.billType = '_DM_BILL';
    }

    if (this.cmdmSearchParam.documentSubType === 'credit') {
      this.cmdmBillModelRequest.billType = 'CREDIT' + this.cmdmBillModelRequest.billType;
    } else if (this.cmdmSearchParam.documentSubType === 'retail') {
      this.cmdmBillModelRequest.billType = 'RETAIL' + this.cmdmBillModelRequest.billType;
    } else if (this.cmdmSearchParam.documentSubType === 'allied') {
      if(this.alliedBillType==='ALLIED_RETAIL_BILL') {
        this.cmdmBillModelRequest.billType = 'RETAIL_ALLIED' + this.cmdmBillModelRequest.billType;
      }else {
        this.cmdmBillModelRequest.billType = 'ALLIED' + this.cmdmBillModelRequest.billType;
      }
    } else {
      this.cmdmBillModelRequest.billType = 'WMS' + this.cmdmBillModelRequest.billType;
    }
    this.cmdmBillModelRequest.custId = this.custMsaId;
    this.cmdmBillModelRequest.branchId = this.billBranchId;
    this.cmdmBillModelRequest.customerName = this.billToCustName;
    this.cmdmBillModelRequest.gstNum = this.gstNum;
    this.cmdmBillModelRequest.billToAddr = this.billToAddr;
    this.cmdmBillModelRequest.billToCity = this.billToCity;
    this.cmdmBillModelRequest.billToState = this.billToState;
    this.cmdmBillModelRequest.billToAddrLine1 = this.billToAddrLine1;
    this.cmdmBillModelRequest.billToAddrLine2 = this.billToAddrLine2;
    this.cmdmBillModelRequest.billToAddrLine3 = this.billToAddrLine3;
    this.cmdmBillModelRequest.billToLocation = this.billToLocation;
    this.cmdmBillModelRequest.billToPincode = this.billToPincode;
    this.cmdmBillModelRequest.blngBrAddr = this.blngBrAddr;
    this.cmdmBillModelRequest.blngBrCity = this.blngBrCity;
    this.cmdmBillModelRequest.blngBrLocation = this.blngBrLocation;
    this.cmdmBillModelRequest.blngBrState = this.blngBrState;
    this.cmdmBillModelRequest.ebillFlag = this.ebillFlag;
    this.cmdmBillModelRequest.email = this.email;
    this.cmdmBillModelRequest.custMsaCode = this.custMsaCode;
    this.cmdmBillModelRequest.sfxCode = this.sfxCode;
    this.cmdmBillModelRequest.rateCardCode = this.rateCardCode;
    this.cmdmBillModelRequest.blngBrGst = this.blngBrGst;
    // if (!this.cmdmSearchParam.isBulkUpload) {

    //   this.cmdmBillModelRequest.billingLevelId = this.billingLevelId;
    //   this.cmdmBillModelRequest.billingLevel = this.billingLevel;
    //   this.cmdmBillModelRequest.billingLevelCode = this.billingLevelCode;
    // }
    this.cmdmBillModelRequest.billingLevelId = this.billingLevelId;
    this.cmdmBillModelRequest.billingLevel = this.billingLevel;
    this.cmdmBillModelRequest.billingLevelCode = this.billingLevelCode;
    this.cmdmBillModelRequest.cmdmBillLines = this.dataSource.data;
    console.log(this.cmdmBillModelRequest);
  }

  // tax and updated waybill outstanding calculation.
  calcTax(index) {
    const tempCmdmline = this.dataSource.data[index];
    const tempAmt = tempCmdmline.lineAmt;
    tempCmdmline.totalLineAmtGrouped = tempCmdmline.lineAmt;
    const taxableAmountStr = ((tempAmt / 118) * 100).toString();
    console.log(taxableAmountStr);
    console.log('taxableAmountStr.indexOf', taxableAmountStr.indexOf('.', 0) + 3);

    console.log('taxableAmountStr.indexOf(, 0 )', taxableAmountStr.indexOf('.', 0));

    // tempAmt is multiple of 118
    if (taxableAmountStr.indexOf('.', 0) == -1) {
      tempCmdmline.taxableAmount = Number(((tempAmt / 118) * 100).toFixed(2));
    } else {
      tempCmdmline.taxableAmount = Number((Number(taxableAmountStr.slice(0, taxableAmountStr.indexOf('.', 0) + 3)).toFixed(2)));
    }
    if (tempCmdmline.oracleTaxRate === 18) {
      tempCmdmline.igstAmt = Number((((tempCmdmline.taxableAmount * tempCmdmline.oracleTaxRate) / 100)).toFixed(2));
      tempCmdmline.cgstAmt = Number((0).toFixed(2));
      tempCmdmline.sgstAmt = Number((0).toFixed(2));

    } else if (tempCmdmline.oracleTaxRate === 9) {
      tempCmdmline.igstAmt = Number((0).toFixed(2));
      tempCmdmline.cgstAmt = Number((((tempCmdmline.taxableAmount * tempCmdmline.oracleTaxRate) / 100)).toFixed(2));
      tempCmdmline.sgstAmt = Number((((tempCmdmline.taxableAmount * tempCmdmline.oracleTaxRate) / 100)).toFixed(2));

    }

    // to update invoice outstanding amount.
    if ('WAYBILL' === this.cmdmSearchParam.documentWise && 'CREDIT_NOTE' === this.cmdmSearchParam.documentType) {
      tempCmdmline.updtWaybillOS = (tempCmdmline.outstandingAmt ? tempCmdmline.outstandingAmt : 0) - tempCmdmline.lineAmt;
    } else if ('WAYBILL' === this.cmdmSearchParam.documentWise && 'DEBIT_NOTE' === this.cmdmSearchParam.documentType) {
      tempCmdmline.updtWaybillOS = tempCmdmline.lineAmt + (tempCmdmline.outstandingAmt ? tempCmdmline.outstandingAmt : 0);
    }

    if(tempCmdmline.oracleTaxRate == null){
        tempCmdmline.taxableAmount = tempCmdmline.lineAmt;
    }
    
    this.dataSource.data[index] = tempCmdmline;

  }

  // add new line in the mat table.
  addNewCMDMLineInTable(billId, billType, billNum, wayBillId, waybillNum, baseAmount, outstandingAmount,
    oracleARTrasactionId, oracleARTaxRateCode, oracleARTaxRate, billToAddress, billToAddrId, billDate,
    bkgBranchId, bkgBranch, collBranch, collBranchId, altCollBranchId, altCollBranch, submsnBranchId, submsnBranch,
    blngBranchId, blngBranch, wayBilType, invOutstandingamt) {
    const element = {
      lineNumber: this.dataSource.data.length + 1,
      documentId: billId,
      documentType: billType,
      billDt: billDate,
      billNumber: billNum,
      waybillId: wayBillId,
      waybillNumber: waybillNum,
      reasonId: null,
      reason: null,
      lineAmt: null,
      amount: baseAmount,
      remark: null,
      taxableAmount: 0.00,
      sgstAmt: 0.00,
      cgstAmt: 0.00,
      igstAmt: 0.00,
      message: null,
      outstandingAmt: outstandingAmount,
      oracleArTrasactionId: oracleARTrasactionId,
      oracleTaxRateCode: oracleARTaxRateCode,
      oracleTaxRate: oracleARTaxRate,
      billToAddr: billToAddress,
      billToAddressId: billToAddrId,
      bkgBrId: bkgBranchId,
      bkgBr: bkgBranch,
      collBr: collBranch,
      collBrId: collBranchId,
      altCollBrId: altCollBranchId,
      altCollBr: altCollBranch,
      submsnBrId: submsnBranchId,
      submsnBr: submsnBranch,
      blngBrId: blngBranchId,
      blngBr: blngBranch,
      waybillType: wayBilType,
      actInvOutstandingAmt: invOutstandingamt,
      updtWaybillOS: null,
      totalLineAmtGrouped: 0.00
    };
    this.dataSource.data.push(Object.assign({}, element));
    this.dataSource = new MatTableDataSource(this.dataSource.data);
  }

  deleteAllLines() {
    this.dataSource.data.splice(0, this.dataSource.data.length);
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
    this.refresh();
  }

  exportToExcel() {
    const excelHeaders = ['Line Number', 'Reason', 'Amount', 'Bill Number', 'Waybill Number', 'Remarks', 'Message'];
    const excelData = this.dataSource.data.map((obj) => ([obj.lineNumber,
    obj.reasonId,
    obj.lineAmt,
    obj.billNumber,
    obj.waybillNumber,
    obj.remark,
    obj.message]));
    this._exportToService.export2Excel(excelHeaders, 'Sheet1', excelData, 'CMDM-EXCEL-TABLE-EXPORT');
  }


  getIgstTotal() {
    return this.dataSource.data.map(t => t.igstAmt).reduce((acc, value) => Number(acc) + Number(value), 0).toFixed(2);
  }

  getSgstTotal() {
    return this.dataSource.data.map(t => t.sgstAmt).reduce((acc, value) => Number(acc) + Number(value), 0).toFixed(2);
  }

  getCgstTotal() {
    return this.dataSource.data.map(t => t.cgstAmt).reduce((acc, value) => Number(acc) + Number(value), 0).toFixed(2);
  }

  getTaxTotal() {
    return Number(this.dataSource.data.map(t => t.taxableAmount).reduce((acc, value) => Number(acc) + Number(value), 0)).toFixed(2);
  }

  getLineTotal() {
    return this.dataSource.data.map(t => t.lineAmt).reduce((acc, value) => Number(acc) + Number(value), 0).toFixed(2);
  }

  refresh() {
    this._cd.detectChanges();
  }

  // errors function
  handleError(error: any) {
    if (error.error != null) {
      console.log(error);
      console.log(error.error);
      if (error.error.errorCode === 'handled_exception') {
        this._toastr.warning((error.error.errorMessage));
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

  // to get branch detail by branch id
  getBranchGstByBranchId(brId: number, brName: string, waybill: WaybillModel, billDate: Date, wayBillType: string, documentType: string) {
    
    console.log('wayBillType:  ' ,wayBillType);
    this._cmdmService.getBranchById(brId).subscribe(response => {
      this.branchDetail = response['data'];
      if (this.branchDetail == null) {
        this._toastr.warning('No Data Found For Bill Branch or Bill branch Id is null on Waybill');
      } else {
        this.blngBrGst = this.branchDetail.branchGstNum;
        // add cmdm line based on waybill type.
        this.addNewCMDMLineInTable(null, documentType, null, waybill.waybillId,
          waybill.waybillNumber, waybill.baseAmount, waybill.outstandingAmount, null,
          null, this.blngBrGst == null ? '07' : this.getCheckRetailGstValid(this.blngBrGst, waybill.gstNum), waybill.billToAddr, null, billDate, brId, brName, brName, brId, brId,
          brName, brId, brName, brId, brName, wayBillType =='TO-PAY'?'TOPAY':wayBillType, waybill.outstandingAmount);
      }
    });
  }

  // validate branches
  getCheckRetailGstValid(brnachGst: string, waybillGst: string) {
    if (brnachGst && waybillGst) {
      if (brnachGst.substring(0, 2) === waybillGst.substring(0, 2)) {
        return 9;
      } else {
        return 18;
      }
    } else {
      this._toastr.warning('Gst Number is not present in waybill');
    }
  }
}
