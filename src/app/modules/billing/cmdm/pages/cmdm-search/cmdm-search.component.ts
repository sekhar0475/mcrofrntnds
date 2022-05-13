import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CMDMSearchParam } from '../../models/CMDMSearchParam';
import { CmdmService } from '../../services/cmdm.service';
import { ToastrService } from 'ngx-toastr';
import { LookUpResponse } from '../../models/LookUpResponse';


@Component({
  selector: 'app-cmdm-search',
  templateUrl: './cmdm-search.component.html',
  styleUrls: ['./cmdm-search.component.scss']
})
export class CmdmSearchComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  documentSubType: string;
  createFormGroup: FormGroup;
  cmdmSearchParam: CMDMSearchParam = {} as CMDMSearchParam;
  isCreditNote = false;
  isCredit = false;
  isRetail = false;
  isAllied = false;
  isWaybill = false;
  isWMS = false;
  showResult = false;

  documentTypes: LookUpResponse[];
  documentWises: LookUpResponse[];
  createdAgainsts: string[];
  selectedFile: any;
  isFileSelected = false;
  documentWise = null;

  createdAgainstValue: string;
  documentWiseValue: string;

  constructor(
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _cd: ChangeDetectorRef,
    private _cmdmService: CmdmService) {
  }

  ngOnInit() {
    this._route.paramMap.subscribe(
      paramMap => {
        this.documentSubType = paramMap.get('documentSubType');
        this.initForm();
        this.setupUI();
        this.initData();
      }
    );
    console.log(this.documentSubType);
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      documentType: new FormControl(null, [Validators.required]),
      documentWise: new FormControl(),
      documentNumber: new FormControl(),
      createdAgainst: new FormControl(null, [Validators.required]),
      waybillNumber: new FormControl(null, [Validators.required]),
    });
  }

  updateFormValidation() {
    if (!this.isWaybill) {
      console.log('Update inside !this.isWaybill', this.isWaybill);
      if (!this.isRetail) {
        console.log('Update inside !this.isRetail', this.isWaybill, this.isRetail);
        this.createFormGroup.get('createdAgainst').clearValidators();
        this.createFormGroup.get('createdAgainst').updateValueAndValidity();
      }
      this.createFormGroup.get('waybillNumber').clearValidators();
      this.createFormGroup.get('waybillNumber').updateValueAndValidity();
    } else {

      console.log('Update inside Else', this.isWaybill, this.isRetail);
      if (!this.isWaybill) {
        console.log('Update inside Else !this.isWaybill', this.isWaybill, this.isRetail);
        this.createFormGroup.get('waybillNumber').clearValidators();
        this.createFormGroup.get('waybillNumber').updateValueAndValidity();
      } else {
        console.log('Update inside Else !this.isWaybill else', this.isWaybill, this.isRetail);
        this.createFormGroup.get('documentWise').clearValidators();
        this.createFormGroup.get('documentWise').updateValueAndValidity();
        this.createFormGroup.get('waybillNumber').clearValidators();
        this.createFormGroup.get('waybillNumber').updateValueAndValidity();

      }
    }
  }
  initData() {
    this._cmdmService.getDocumentTypes().subscribe((res) => {
      this.documentTypes = res['data'];
    },
      (err) => {
        this.handleError(err);
      });
    this._spinner.show();
    this._cmdmService.getDocumentWises().subscribe((res) => {
      this.documentWises = res['data'];
      this._spinner.hide();
    }, (err) => {
      this.handleError(err);
      this._spinner.hide();
    });
    this.createdAgainsts = this._cmdmService.getCreatedAgainsts();
  }

  setupUI() {
    console.log('main setup', this.documentSubType, this.documentWise);
    if ('retail' === this.documentSubType) {
      this.isRetail = true;
      this.isCredit = false;
      this.isWMS = false;
      this.isAllied = false;


    } else if ('credit' === this.documentSubType) {
      this.isCredit = true;
      this.isRetail = false;
      this.isWMS = false;
      this.isAllied = false;
      console.log('Credit: ', this.isCredit);
      this.createFormGroup.get('waybillNumber').disable();


    } else if ('wms' === this.documentSubType) {
      this.isWMS = true;
      this.isRetail = false;
      this.isCredit = false;
      this.isAllied = false;
      console.log('WMS: ', this.isWMS);


      this.updateFormValidation();
      this.createFormGroup.get('documentWise').setValue('Bill');

    } else if ('allied' === this.documentSubType) {
      this.isAllied = true;
      this.isRetail = false;
      this.isCredit = false;
      this.isWMS = false;

      this.updateFormValidation();
      this.createFormGroup.get('documentWise').setValue('Bill');
    }
    this.refresh();
  }

  onDocumentTypeChange(event) {
    this.isCreditNote = false;
    if (event === undefined) {
      return;
    }

    const selectedDocumentType = event.lookupVal;
    if ('CREDIT_NOTE' === selectedDocumentType) {
      this.isCreditNote = true;
    }
  }

  onCreatedAgainstChange(event: any, isDocumentWise: boolean) {
    this.isWaybill = false;
    if (event === undefined) {
      return;
    }
    if (isDocumentWise) {

      console.log('Inside else isDocumentWise')
      this.onDocumentWiseChange(event);
    } else {
      console.log('Inside else onCreatedAgainstChange')
      let selectedCreatedAgainst = event;
      this.createdAgainstValue = selectedCreatedAgainst;
      this.createFormGroup.get('documentWise').setValue('BILL');
      if ('Waybill' === selectedCreatedAgainst) {
        console.log('Inside Waybill');
        console.log('this.isWaybill', this.isWaybill);
        this.isWaybill = true;
        this.documentWiseValue = 'WAYBILL';

        this.createFormGroup.get('documentWise').setValue('WAYBILL');
        this.createFormGroup.get('documentNumber').disable();
        this.createFormGroup.get('documentWise').disable();
        this.createFormGroup.get('documentNumber').setValue(null);
      } else if ('GST Invoice' === selectedCreatedAgainst) {
        console.log('Inside GST Invoice');
        this.isWaybill = false;
        this.createFormGroup.get('documentWise').enable();
        this.createFormGroup.get('documentNumber').enable();
        this.createFormGroup.get('waybillNumber').enable();
        console.log('this.isWaybill', this.isWaybill);
      } else if ('GST Invoice' === selectedCreatedAgainst && 'BILL' === this.documentWiseValue) {
        console.log('Inside GST Invoice and bill');
        this.isWaybill = false;
        this.createFormGroup.get('waybillNumber').disable();
        this.createFormGroup.get('documentNumber').enable();
        console.log('this.isWaybill', this.isWaybill);
      } else if ('GST Invoice' === selectedCreatedAgainst && 'WAYBILL' === this.documentWiseValue) {
        console.log('Inside GST Invoice and waybill');
        this.isWaybill = false;
        this.createFormGroup.get('waybillNumber').enable();
        this.createFormGroup.get('documentNumber').enable();
        console.log('this.isWaybill', this.isWaybill);
      }

      this.showResult = false;
      this.updateFormValidation();
      this.refresh();
    }
  }

  onDocumentWiseChange(event) {
    this.isWaybill = false;
    const selectedDocumentWise = event.lookupVal;
    this.documentWiseValue = selectedDocumentWise;

    if ('WAYBILL' === selectedDocumentWise) {
      if (this.createdAgainstValue === 'GST Invoice') {
        console.log('came inside created against ', this.createdAgainstValue);
        this.isWaybill = true;
        this.createFormGroup.get('waybillNumber').enable();
        this.createFormGroup.get('documentNumber').enable();
      } else {
        this.isWaybill = true;
      }
    } else if ('BILL' === selectedDocumentWise) {
      if (this.createdAgainstValue === 'GST Invoice') {
        this.isWaybill = false;
        this.createFormGroup.get('waybillNumber').disable();
      } else {
        this.isWaybill = false;
      }
    } else {
      this.isFileSelected = false;
    }

    this.showResult = false;
    this.updateFormValidation();
    this.refresh();
  }


  downloadTemplate() {
    this._spinner.show();
    this._cmdmService.downloadBulkUploadTemplate(this.documentSubType).subscribe((res) => {
      if (res.status === 200) {
        this._spinner.hide();
        window.open(res.body);
      } else {
        this._spinner.hide();
        this._toastr.warning('Not able to download excel template, Please try after some time.');
      }
    }, (err) => {
      this._spinner.hide();
      this.handleError(err);
    });
  }

  refresh() {
    this._cd.detectChanges();
  }

  resetComponent(clear) {
    console.log(clear);
    if (clear) {
      this.showResult = false;
      this.createFormGroup.reset();
      this.setupUI();
    }
  }

  search() {
    const newCmdmSearchParam = {} as CMDMSearchParam;
    newCmdmSearchParam.documentSubType = this.documentSubType;
    newCmdmSearchParam.documentNumbers = this.createFormGroup.get('documentNumber').value;
    newCmdmSearchParam.documentWise = this.createFormGroup.get('documentWise').value;
    newCmdmSearchParam.createdAgainst = this.createFormGroup.get('createdAgainst').value;
    newCmdmSearchParam.documentType = this.createFormGroup.get('documentType').value;
    newCmdmSearchParam.waybillNumbers = this.createFormGroup.get('waybillNumber').value ?
      this.createFormGroup.get('waybillNumber').value.trim() : '';
    newCmdmSearchParam.isWaybill = this.isWaybill;
    newCmdmSearchParam.isCredit = this.isCredit;
    newCmdmSearchParam.isCreditNote = this.isCreditNote;
    newCmdmSearchParam.isBulkUpload = this.isFileSelected;
    newCmdmSearchParam.fileInput = this.fileInput;
    newCmdmSearchParam.selectedFile = this.selectedFile;
    newCmdmSearchParam.creditMemoDate = new Date().toLocaleDateString();

    if (!this.isRetail && !this.isWaybill) {
      if (newCmdmSearchParam.documentNumbers == null) {
        this._toastr.warning('Please Enter Document Number for search');
      } else {
        this.cmdmSearchParam = newCmdmSearchParam;
        this.showResult = true;
      }
    } else if (this.isCredit && this.isWaybill) {
      if (newCmdmSearchParam.documentNumbers == null) {
        this._toastr.warning('Please Enter Document Number for search');
      } else {
        this.cmdmSearchParam = newCmdmSearchParam;
        this.showResult = true;
      }
    } else {
      if (newCmdmSearchParam.documentNumbers == null && (!this.isWaybill || 'GST Invoice' === this.createdAgainstValue)) {
        this._toastr.warning('Please Enter Document Number for search');
      } else {
        this.cmdmSearchParam = newCmdmSearchParam;
        this.showResult = true;
      }
    }
  }

  chooseFileToUpload(event: any) {
    this.selectedFile = null;
    this.selectedFile = event.target.files[0];
    this.isFileSelected = true;
  }

  uploadValidateAndShow() {
    if (this.isFileSelected) {
      this.search();
    } else {
      this._toastr.warning('First please choose excel file to upload.');
    }
  }

  skipUploadAndSearch() {
    this.selectedFile = null;
    this.isFileSelected = false;
    this.search();
  }

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

  checkDocSubType(): boolean {
    if (this.documentSubType === 'retail' || this.documentSubType === 'credit') {
      return false;
    }
    else {
      return true;
    }

  }

}
