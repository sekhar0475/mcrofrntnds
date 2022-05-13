import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { SearchInvWayBill } from '../../models/search-bill-data.model';
import { DocumentTypeList } from '../../models/document-type.model';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { DocumentBranch } from '../../models/document-branch.model';
import { DocumentBranchComponent } from '../document-branch/document-branch.component';
import { UploadResult } from '../../../invoice-receipt-waybill-result/models/upload-data.model';
import { InvoiceWriteOffService } from '../../../invoice-write-off/services/invoice-write-off.service';
import { WaybillTypeList } from '../../models/waybill-type.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-invoice-waybill-search-upload',
  templateUrl: './invoice-waybill-search-upload.component.html',
  styleUrls: ['./invoice-waybill-search-upload.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
// invoice and Waybill Search and Upload excel component
export class InvoiceWaybillSearchUploadComponent implements OnInit {
  // intially false if routed through invoice write off this will be set to true
  @Input() invoiceWriteOff = false;
  // intially false if routed through waybill write off this will be set to true
  @Input() wayBillWriteOff = false;
  searchData: SearchInvWayBill = {
    documentType: null,
    fromDate: null,
    toDate: null,
    documentBrName: null,
    documentBrId: null,
    documentNum: null,
    chequeNum: null
  };
  uploadTag: string;
  documentType = null;
  waybillType = null;
  docBranchId = null;
  // file uploaded
  fileUploaded: File;
  storeData: any;
  worksheet: any;
  documentTypeList: DocumentTypeList[] = [];
  waybillTypeList: WaybillTypeList[] = [];
  searchFormGroup: FormGroup;
  docBranchList: DocumentBranch[] = [];
  displayUploadResult = false; // to display upload component
  displayInputTable = false;   // to display input table for write off
  fileToUpload: File = null;
  uploadData: UploadResult[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef; // excel file

  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService,
    private _invoiceWriteOffService: InvoiceWriteOffService
  ) { }


  ngOnInit() {
    this.documentTypeLookup();
    this.initForm();
  }

  // replace with bill type Lov for bill type
  documentTypeLookup() {
    if (this.invoiceWriteOff) {
      this._spinner.show();
      this._lookupService.getLookupValuesByType('DEVIATION_INV_WRTOFF_DOC_TYPE').subscribe(
        response => {
          this._spinner.hide();
          response.data.forEach(
            lkps => {
              this.documentTypeList = [...this.documentTypeList, {
                documentId: lkps.id, documentViewVal: lkps.descr,
                documentValue: lkps.lookupVal
              }];
            });
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        });
    } else if (this.wayBillWriteOff) {
      this._spinner.show();
      this._lookupService.getLookupValuesByType('DOC_DEVIATION_WAYBILL_TYPE').subscribe(
        response => {
          this._spinner.hide();
          response.data.forEach(
            lkps => {
              this.documentTypeList = [...this.documentTypeList, {
                documentId: lkps.id, documentValue: lkps.lookupVal,
                documentViewVal: lkps.descr
              }];
            });
        },
        error => {
          this._spinner.hide();
          this.handleError(error);
        });
      // call waybill lookup if present in waybill write of Ui
      this.waybillTypeLookUp();
    }
  }

  // way bill type
  waybillTypeLookUp() {
    this._spinner.show();
    this._lookupService.getLookupValuesByType('DEVIATION_WAYBILL_TYPE').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.waybillTypeList = [...this.waybillTypeList, {
              waybillTypeId: lkps.id, waybillTypeValue: lkps.lookupVal
              , waybillViewVal: lkps.descr
            }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  // for page validations
  initForm() {
    if (this.invoiceWriteOff) {
      // invoice write off
      this.searchFormGroup = new FormGroup({
        documentTypeFc: new FormControl('CREDIT', [Validators.required]),
        documentBrFc: new FormControl('', [Validators.required]),
        fromDtFc: new FormControl(''),
        toDtFc: new FormControl(''),
        documentNumFc: new FormControl('', [Validators.required])
      });
    } else {
      // way bill write off
      this.searchFormGroup = new FormGroup({
        documentTypeFc: new FormControl('RETAIL', [Validators.required]),
        documentBrFc: new FormControl('', [Validators.required]),
        fromDtFc: new FormControl(''),
        toDtFc: new FormControl(''),
        documentNumFc: new FormControl('', [Validators.required]),
        waybillTypeFc: new FormControl('PAID', [Validators.required]),
      });
    }
  }

 

  // for document branch search
  documentBrSearch() {
    const dialogRef = this._dialog.open(DocumentBranchComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          this.searchFormGroup.controls.documentBrFc.setValue(result[0].branchName);
          this.searchData.documentBrId = result[0].branchId;
          this.docBranchId = result[0].branchId;
        }
      }
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



  // to handel header for invoice and waybill write-off
  header() {
    if (this.invoiceWriteOff) {
      this.uploadTag = 'Bulk Invoice Write-off';
      return 'Invoice Write-Off';
    } else if (this.wayBillWriteOff) {
      this.uploadTag = 'Bulk Waybill Write-off';
      return 'Waybill Write-Off';
    }
  }

  // on search click
  search() {
    if (this.invoiceWriteOff) {
      this.invoiceWriteOffSearchValues();
    } else {
      this.waybillWriteOffSearchValues();
    }
  }

  // invoice write off search values
  invoiceWriteOffSearchValues() {
    const newSearchData = {} as SearchInvWayBill;
    this.fileInput.nativeElement.value = null;
    // on search assigning values to the export data to child
    const documentType = this.searchFormGroup.get('documentTypeFc').value;
    const fromDate = this.searchFormGroup.get('fromDtFc').value;
    const documentnum = this.searchFormGroup.get('documentNumFc').value;
    const todate = this.searchFormGroup.get('toDtFc').value;
    const docBranchName = this.searchFormGroup.get('documentBrFc').value;
    const docBranchId = this.searchData.documentBrId;
    // assign values
    newSearchData.fromDate = fromDate;
    newSearchData.documentNum = documentnum == null ? '' : documentnum;
    newSearchData.toDate = todate;
    newSearchData.documentBrId = docBranchId == null ? 0 : docBranchId;
    newSearchData.documentBrName = docBranchName;
    newSearchData.documentType = documentType;
    // assign to searchdata for any changes
    this.searchData = newSearchData;
    // on search enable only input table component
    this.displayUploadResult = false;
    this.displayInputTable = true;
  }


  // waybill write off search values
  waybillWriteOffSearchValues() {
    const newSearchData = {} as SearchInvWayBill;
    this.fileInput.nativeElement.value = null;
    // on search assigning values to the export data to child
    const documentType = this.searchFormGroup.get('documentTypeFc').value;
    const fromDate = this.searchFormGroup.get('fromDtFc').value;
    const documentnum = this.searchFormGroup.get('documentNumFc').value;
    const todate = this.searchFormGroup.get('toDtFc').value;
    const docBranchName = this.searchFormGroup.get('documentBrFc').value;
    const docBranchId = this.searchData.documentBrId;
    // assign values
    this.documentType = this.searchFormGroup.get('documentTypeFc').value;  // document type
    this.waybillType = this.searchFormGroup.get('waybillTypeFc').value; // way bill type
    newSearchData.fromDate = fromDate;
    newSearchData.documentNum = documentnum == null ? '' : documentnum;
    newSearchData.toDate = todate;
    newSearchData.documentBrId = docBranchId == null ? 0 : docBranchId;
    newSearchData.documentBrName = docBranchName;
    newSearchData.documentType = documentType;
    // assign to searchdata for any changes
    this.searchData = newSearchData;
    // on search enable only input table component
    this.displayUploadResult = false;
    this.displayInputTable = true;
  }

  // clear search values from parent table.
  getClearValue(selected: boolean) {
    if (selected) {
      this.displayInputTable = false;
      this.displayUploadResult = false;
      this.searchFormGroup.reset();
    } else {
      this.displayUploadResult = false;
      this.displayInputTable = false;
    }
  }

  // clear search values from parent table.
  getClearValueExcel(selected: boolean) {
    if (selected) {
      this.displayInputTable = false;
      this.displayUploadResult = false;
      this.fileInput.nativeElement.value = null;
      this.searchFormGroup.reset();
    } else {
      this.displayUploadResult = false;
      this.displayInputTable = false;
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
  }

  // on click validate and show
  uploadExcel() {
    let newUploadData: UploadResult[] = [];
    this.documentType = this.searchFormGroup.get('documentTypeFc').value;
    if (this.wayBillWriteOff) {
      this.waybillType = this.searchFormGroup.get('waybillTypeFc').value;
    }
    newUploadData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
    this.uploadData = newUploadData;
    // validation
    this.validateExcelData(newUploadData);
    if (!this._toastr.currentlyActive) {
      // for sending data to parent component
      this.displayUploadResult = true;
      this.displayInputTable = false;
    }
  }

  //  excel data validation before sent to data base for validation
  validateExcelData(uploadData: UploadResult[]) {
    console.log(uploadData);
    let i = 0;
    let noDocumentNum = 0;
    let noDocType = 0;
    let noWriteOffAmt = 0;
    let noWriteOffReason = 0;
    let noRemarks = 0;
    let notValidDocumentType = 0;

    // temporary array
    const valueArr = uploadData.map(function (item) { return item.documentNumber; });
    // flag to check if duplicate exists
    const isDuplicate = valueArr.some(function (item, idx) { return valueArr.indexOf(item) !== idx; });

    for (i = 0; i < uploadData.length; i++) {
      if (this.uploadData[i].writeOffAmt == null) {
        noWriteOffAmt = 1;
      }
      if (this.uploadData[i].writeOffReason == null) {
        noWriteOffReason = 1;
      }
      if (this.uploadData[i].documentNumber == null) {
        noDocumentNum = 1;
      }
      if (this.uploadData[i].documentType == null) {
        noDocType = 1;
      }
      if (this.uploadData[i].remarks == null) {
        noRemarks = 1;
      }

      if (this.uploadData[i].documentType !== this.documentType) {
        notValidDocumentType = 1;
      }
    }

    if (isDuplicate) {
      this.displayUploadResult = false;
      this._toastr.warning('Duplicate Document Number Entered');
    }

    if (noWriteOffAmt > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Ether Write-off field not matching with Template or Amount is Null');
    }
    if (noWriteOffReason > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Ether Write-off Reason field not matching with Template or Reason is Null');
    }
    if (noDocumentNum > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Ether Document Number field not matching with Template or Number is Null');
    }
    if (noDocType > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Ether Document Type field not matching with Template or Type is Null');
    }

    if (noRemarks > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Please Enter remarks field as per the Template');
    }

    if (notValidDocumentType > 0) {
      this.displayUploadResult = false;
      this._toastr.warning('Document Type Must Be: ' + this.documentType + ' : In the Upload File');
    }
  }
  // download template
  downloadTemplate() {
    this._spinner.show();
    this._invoiceWriteOffService.downloadBulkUploadTemplate().then((res) => {
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
}
