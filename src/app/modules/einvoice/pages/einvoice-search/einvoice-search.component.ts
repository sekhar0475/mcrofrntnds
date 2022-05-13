import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { EInvoiceSearchRequest } from '../../models/search-request.model';
import { EInvoiceSearchResponse } from '../../models/search-response.model';
import { StatusLookUpResponse } from '../../models/status.model';
import { EinvoiceService } from '../../services/einvoice.service';
import * as XLSX from 'xlsx';
import { UploadEinvResult } from '../../models/upload-einv-result.model';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { uploadErrorData } from '../../models/upload-error-data.model';

@Component({
  selector: 'app-einvoice-search',
  templateUrl: './einvoice-search.component.html',
  styleUrls: ['./einvoice-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class EinvoiceSearchComponent implements OnInit {

  statusList: StatusLookUpResponse[] = [];
  searchFormGroup: FormGroup;
  searchValues: EInvoiceSearchRequest = {} as EInvoiceSearchRequest;
  maxDate: Date;
  docType: string;
  showResult: boolean = false;
  checkIfCredit: boolean = false;
  checkIfRetail: boolean = false;
  ifExcelUploaded: boolean = true;
  fileUploaded: File;
  storeData: any;
  worksheet: any;
  uploadData: UploadEinvResult[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef; // excel file

  uploadErrors: uploadErrorData[] = [];
  
  constructor(
    private _service: EinvoiceService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _cd: ChangeDetectorRef,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit() {

    this._route.paramMap.subscribe(
      paramMap => {
        this.docType = paramMap.get('documentType');        
        if(this.docType == 'credit') {
          this.checkIfCredit = true;
        }
        if(this.docType == 'retail'){
          this.checkIfRetail= true;
        }
        this.initForm();
        this.loadStatus();
        this.convertDate();
        this._service.current_data = {} as EInvoiceSearchResponse;
      }
    );

  }

  initForm() {
    this.searchFormGroup = new FormGroup({
      documentTypeFc: new FormControl(this.docType, [Validators.required]),
      statusFc: new FormControl(null, [Validators.required]),
      fromDtFc: new FormControl('', [Validators.required]),
      toDtFc: new FormControl('', [Validators.required]),
      documentNumFc: new FormControl(''),
      BuyerGSTINFc: new FormControl('',[Validators.minLength(3), Validators.maxLength(15), Validators.pattern("^(([0-9]{2}[0-9A-Z]{13})|URP)$")]),
      batchNumFc: new FormControl('')
    });
  }

  loadStatus() {
    
    this._service.getStatusValues().subscribe(
      response => {
        this.statusList = response['data'];
      }
    );
  }

  
  //function to convert dates
  convertDate() {
    const dte = new Date();
    this.searchValues.toDate = new Date();
    dte.setDate(dte.getDate() - 84);
    this.searchValues.fromDate = dte;
        
  }

  header() {
    return 'Search E-invoice';
  }

  clear() {
    this.ngOnInit();
  }

  setMaxDateForCalender(){

    let fromDate = this.searchFormGroup.get('fromDtFc').value;
    let fullyear = this._datePipe.transform(fromDate, "yyyy");

    this.maxDate = new Date();
    this.maxDate.setDate(fromDate.getDate());
    this.maxDate.setMonth(fromDate.getMonth() + 3);
    this.maxDate.setFullYear(Number(fullyear));

  }

 
  search() {
    const newSearchParams = {} as EInvoiceSearchRequest;
    newSearchParams.buyerGstin = this.searchFormGroup.get('BuyerGSTINFc').value;
    newSearchParams.documentNum = this.searchFormGroup.get('documentNumFc').value;
    newSearchParams.documentType = this.searchFormGroup.get('documentTypeFc').value;
    newSearchParams.fromDate = this.searchFormGroup.get('fromDtFc').value;
    newSearchParams.toDate = this.searchFormGroup.get('toDtFc').value;
    newSearchParams.status = this.searchFormGroup.get('statusFc').value;
    newSearchParams.batchNum = this.searchFormGroup.get('batchNumFc').value;
    this.searchValues = newSearchParams;
    this.showResult = true;
  }

  resetComponent(clear) {
  
    this.showResult = false;
    if (clear.resetComponent && !clear.resetOnlyTable) {
      
      if(this.fileInput) {
        this.fileInput.nativeElement.value = null;
      }
      this.ifExcelUploaded = true;
      this.uploadData = [];
      this.refresh();
      this.ngOnInit();
    }

  }

  refresh() {
    this._cd.detectChanges();
  }

  downloadTemplate(){
    this._spinner.show();
    this._service.downloadBulkUploadTemplate().then((res) => {
      this._spinner.hide();
      if (res.status === 200) {
        window.open(res.body);
      } else {
        this._toastr.warning('Not able to download excel template, Please try after some time.');
      }
    }).catch((err) => {
      this._spinner.hide();
      this.handleError(err);
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

  // upload excel
  uploadedFile(file: FileList) {
    this.fileUploaded = file.item(0);
    this.readExcel();
  }

  // read excel file
  readExcel() {
    const readFile = new FileReader();
    readFile.onload = (e) => {
      this.storeData = readFile.result;
      const data = new Uint8Array(this.storeData);
      const dataArry = new Array();
      for (let i = 0; i !== data.length; ++i) {
        dataArry[i] = String.fromCharCode(data[i]);
      }
      const bstr = dataArry.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[firstSheetName];
    };
    readFile.readAsArrayBuffer(this.fileUploaded);
    this.ifExcelUploaded=false;
  }

   // on click validate and show
   uploadExcel() {
    this.uploadData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
    console.log('newUploadData');
    console.log(this.uploadData);

    this.validateExcelData(this.uploadData);

    if (!this._toastr.currentlyActive) {
      this.showResult=true;
      this.searchValues.documentType=this.searchFormGroup.get('documentTypeFc').value;  
    }
    // this.showResult=true;
    // this.searchValues.documentType=this.searchFormGroup.get('documentTypeFc').value; 
  }

  //  excel data validation before sent to data base for validation
  validateExcelData(uploadData: UploadEinvResult[]) {
    console.log(uploadData);

    this.uploadErrors = [];    

    let i = 0;
    let j = 0;

    let noDocumentNum = 0;
    let noBuyerPin = 0;
    let notNumberPin = 0;
    let noBuyerStateCode = 0;
    let notNumberStateCode = 0;
    let noBuyerPlaceOfSupply = 0;
    let notNumberPOS = 0;
    let incorrectDateFormat = 0;

    let errorMessage: string [] = [];
    for (i = 0; i < uploadData.length; i++) {

      for(j = uploadData.length - 1; j != i && j >= 0 ; j--) {
        if(uploadData[i].documentNumber == uploadData[j].documentNumber) {
          errorMessage.push('Duplicate Document Number');
          break;
        }
      }

      if (this.uploadData[i].buyerPin == null) {
        errorMessage.push('Pincode is Null');
      }
      if (this.uploadData[i].buyerStateCode == null) {
        errorMessage.push('StateCode is Null');
      }
      if (this.uploadData[i].documentNumber == null) {
        errorMessage.push('Document Number is Null');
      }
      if (this.uploadData[i].buyerPlaceOfSupply == null) {
        errorMessage.push('Place of Supply is Null');
      }
      
      if (isNaN(Number(this.uploadData[i].buyerStateCode)) && this.uploadData[i].buyerStateCode != null) {
        errorMessage.push('StateCode is Not a Number');
      }
      if (isNaN(Number(this.uploadData[i].buyerPlaceOfSupply)) && this.uploadData[i].buyerPlaceOfSupply != null) {
        errorMessage.push('Place of Supply is Not a Number');
      }
      if (isNaN(Number(this.uploadData[i].buyerPin)) && this.uploadData[i].buyerPin != null) {
        errorMessage.push('Pincode is Not a Number');
      }
      if(this.uploadData[i].documentDt != null && !this.checkDateFormat(this.uploadData[i].documentDt)) {
        errorMessage.push('Incorrect Date Format, Please use MM-dd-YYYY');
      }

      let uploadError: uploadErrorData = {
        'documentNumber': this.uploadData[i].documentNumber,
        'errorMessage': errorMessage.toString()
      }
      this.uploadErrors.push(uploadError);
      errorMessage = [];
      
    }

    if(uploadData.length > 100) {
      this.showResult = false;
      this._toastr.warning('Number of records present in the file is greater than 100.')
    }
    if(uploadData.length < 1) {
      this.showResult = false;
      this._toastr.warning('No records found.')
    }

  }

  // MM-DD-YYYY
  checkDateFormat(inputValue) {
    const regex =  /^(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])-(19|20)\d{2}$/;
    if(regex.test(inputValue)) {
      return true;
    }
    return false;
  } 

}
