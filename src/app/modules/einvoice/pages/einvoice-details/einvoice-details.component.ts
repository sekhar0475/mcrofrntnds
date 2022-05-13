import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { buyerDetails } from '../../models/buyer-details.model';
import { editRequest } from '../../models/edit-request.model';
import { EInvoiceSearchResponse } from '../../models/search-response.model';
import { sellerDetails } from '../../models/seller-details.model';
import { authResponse } from '../../models/stateCodeResponse/auth-response.model';
import {
  gstinPatternValidator, gstinValidator, legalNameValidator,
  buyerGstinPatternValidator, tradeNameValidator, address1Validator,
  address2Validator, locationValidator, pinValidator, stateCodeValidator,
  placeOfSupplyValidator, legalNamePatternValidator, tradeNamePatternValidator,
  addressPatternValidator, stateCodePatternValidator
  , placeOfSupplyPatternValidator, phoneValidator, phonePatternValidator,
} from '../../services/einvoice-validator';
import { EinvoiceService } from '../../services/einvoice.service';

@Component({
  selector: 'app-einvoice-details',
  templateUrl: './einvoice-details.component.html',
  styleUrls: ['./einvoice-details.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class EinvoiceDetailsComponent implements OnInit {

  editFormGroup: FormGroup;
  invoiceData: EInvoiceSearchResponse;
  authData: authResponse;
  errorMessage: ErrorMsg;

  b2cflag: boolean = false;
  editRequest: editRequest = {} as editRequest;
  buyerDetails: buyerDetails = {} as buyerDetails;
  sellerDetails: sellerDetails = {} as sellerDetails;

  cmdmCheck: boolean = false;
  creditCheck: boolean = false;
  wmsCheck: boolean = false;
  alliedCheck: boolean = false;
  retailCheck: boolean = false;

  irnCheck: boolean = false;

  constructor(

    private _service: EinvoiceService,
    private _router: Router,
    private _dialog: MatDialog,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService

  ) { }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {

    let POS = this._service.current_data.buyerDetails.Gstin.substr(0, 2);

    this.editFormGroup = new FormGroup({
      documentNumFC: new FormControl('', [Validators.required]),
      documentDateFC: new FormControl('', [Validators.required]),

      buyerGstinFC: new FormControl('', [Validators.required, gstinValidator, buyerGstinPatternValidator]),
      sellerGstinFC: new FormControl('', [Validators.required, gstinValidator, gstinPatternValidator]),

      buyerLegalNameFC: new FormControl('', [Validators.required, legalNameValidator, legalNamePatternValidator]),
      sellerLegalNameFC: new FormControl('', [Validators.required, legalNameValidator, legalNamePatternValidator]),

      buyerTradeNameFC: new FormControl('', [tradeNameValidator, tradeNamePatternValidator]),
      sellerTradeNameFC: new FormControl('', [tradeNameValidator, tradeNamePatternValidator]),

      buyerAddressLine1FC: new FormControl('', [Validators.required, address1Validator, addressPatternValidator]),
      sellerAddressLine1FC: new FormControl('', [Validators.required, address1Validator, addressPatternValidator]),

      buyerAddressLine2FC: new FormControl('', [address2Validator, addressPatternValidator]),
      sellerAddressLine2FC: new FormControl('', [address2Validator, addressPatternValidator]),

      buyerAddressLine3FC: new FormControl(''),
      sellerAddressLine3FC: new FormControl(''),

      buyerLocationFC: new FormControl('', [Validators.required, locationValidator, addressPatternValidator]),
      sellerLocationFC: new FormControl('', [Validators.required, locationValidator, addressPatternValidator]),

      buyerPinCodeFC: new FormControl('', [Validators.required, pinValidator]),
      sellerPinCodeFC: new FormControl('', [Validators.required, pinValidator]),

      buyerStateCodeFC: new FormControl('', [Validators.required, stateCodeValidator, stateCodePatternValidator]),
      sellerStateCodeFC: new FormControl('', [Validators.required, stateCodeValidator, stateCodePatternValidator]),

      buyerPhoneFC: new FormControl(null, [phoneValidator]),
      sellerPhoneFC: new FormControl(null, [phoneValidator]),

      buyerEmailFC: new FormControl('', [Validators.email]),
      sellerEmailFC: new FormControl('', [Validators.email]),

      buyerPlaceOfSupplyFC: new FormControl(POS, [Validators.required, placeOfSupplyValidator, placeOfSupplyPatternValidator]),
    })


  }




  //function for b2c checkbox
  b2cTrue(event) {

    this.b2cflag = event;
    if (event) {
      this.editFormGroup.get('buyerGstinFC').disable();
    }
    else {
      this.editFormGroup.get('buyerGstinFC').enable();
    }
  }



  //function to populate page
  loadData() {

    if (this._service.documentType == 'cmdm') {
      this.cmdmCheck = true;
    }
    else if (this._service.documentType == 'credit') {
      this.creditCheck = true;
    }
    else if (this._service.documentType == 'wms') {
      this.wmsCheck = true;
    }
    else if (this._service.documentType == 'allied') {
      this.alliedCheck = true;
    }

    // to check IRN flag
    if (this._service.current_data.irnStatus === 'Success') {
      this.irnCheck = true;
    }





    this.editFormGroup.setValue({
      documentNumFC: this._service.current_data.documentNumber,
      documentDateFC: new Date(this._service.current_data.documentDate),


      buyerGstinFC: this._service.current_data.buyerDetails.Gstin,
      sellerGstinFC: this._service.current_data.sellerDetails.Gstin,

      buyerLegalNameFC: this._service.current_data.buyerDetails.LglNm,
      sellerLegalNameFC: this._service.current_data.sellerDetails.LglNm,

      buyerTradeNameFC: this._service.current_data.buyerDetails.TrdNm,
      sellerTradeNameFC: this._service.current_data.sellerDetails.TrdNm,

      buyerAddressLine1FC: this._service.current_data.buyerDetails.Addr1,
      sellerAddressLine1FC: this._service.current_data.sellerDetails.Addr1,

      buyerAddressLine2FC: this._service.current_data.buyerDetails.Addr2,
      sellerAddressLine2FC: this._service.current_data.sellerDetails.Addr2,

      buyerAddressLine3FC: this._service.current_data.buyerDetails.Addr3,
      sellerAddressLine3FC: this._service.current_data.sellerDetails.Addr3,


      buyerLocationFC: this._service.current_data.buyerDetails.Loc,
      sellerLocationFC: this._service.current_data.sellerDetails.Loc,

      buyerPinCodeFC: this._service.current_data.buyerDetails.Pin,
      sellerPinCodeFC: this._service.current_data.sellerDetails.Pin,

      buyerStateCodeFC: this._service.current_data.buyerDetails.Stcd,
      sellerStateCodeFC: this._service.current_data.sellerDetails.Stcd,

      buyerPhoneFC: this._service.current_data.buyerDetails.Ph,
      sellerPhoneFC: this._service.current_data.sellerDetails.Ph,

      buyerEmailFC: this._service.current_data.buyerDetails.Em,
      sellerEmailFC: this._service.current_data.sellerDetails.Em,


      // buyerPlaceOfSupplyFC: this.editFormGroup.get('buyerGstinFC').value.substr(0,2),
      buyerPlaceOfSupplyFC: this._service.current_data.buyerDetails.Gstin.substr(0, 2),

    })



    //function to disable address fields for cmdm
    if (this.cmdmCheck) {
      this.editFormGroup.controls.buyerAddressLine1FC.disable();
      this.editFormGroup.controls.buyerAddressLine2FC.disable();
      this.editFormGroup.controls.buyerAddressLine3FC.disable();
    }

    if (this.irnCheck) {
      this.editFormGroup.disable();
    }
  }

  updatePOS() {
    this.editFormGroup.controls.buyerPlaceOfSupplyFC.setValue(
      this.editFormGroup.get('buyerGstinFC').value.substr(0, 2))
  }



  //to route back to search page
  goToSearch() {

    this._router.navigate(['/einvoice/', this._service.documentType]);
    this._service.current_data = null;
  }

  // on clicking back
  back() {
    // confirm whether to proceed or not.
    if (this.irnCheck) {
      this.goToSearch();
    }
    else {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Changes made on the Page will be lost. Are you sure you want to proceed?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // navigate.
          this.goToSearch();
        } else {
          // do nothing.
        }
      });
    }
  }

  // on clicking integrate
  integrate() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: 'Changes made cannot be reverted after proceeding. Are you sure?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // navigate.
        this.updateReceipt();
      } else {
        // do nothing.
      }
    });
  }




  //function to pass Pincode to generate stateecode
  getStateCode() {
    this._spinner.show()

    this._service.setStateCode(this.editFormGroup.get('buyerPinCodeFC').value).subscribe(
      NewResponse => {

        if(NewResponse.data.length !== 0) {
          let stateCode = NewResponse.data[0].city.district.state.gstStateCode;
          console.log('Selected State Code: ', stateCode);
  
          this.editFormGroup.controls['buyerStateCodeFC'].setValue(stateCode);
        }
        else {
          this._toastr.warning('Please check the Pincode.')
        }
        this._spinner.hide();
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      }
    )
  }




  //Final function for updating einvoice on IRP Portal
  updateReceipt() {
    this.editRequest.documentId = this._service.current_data.documentId;
    this.editRequest.documentNumber = this.editFormGroup.get('documentNumFC').value;
    this.editRequest.documentDate = this.editFormGroup.get('documentDateFC').value;

    this.sellerDetails.Gstin = this.editFormGroup.get('sellerGstinFC').value;
    this.sellerDetails.LglNm = this.editFormGroup.get('sellerLegalNameFC').value;
    this.sellerDetails.TrdNm = this.editFormGroup.get('sellerTradeNameFC').value;
    this.sellerDetails.Addr1 = this.editFormGroup.get('sellerAddressLine1FC').value;
    this.sellerDetails.Addr2 = this.editFormGroup.get('sellerAddressLine2FC').value;
    this.sellerDetails.Addr3 = this.editFormGroup.get('sellerAddressLine3FC').value;
    this.sellerDetails.Loc = this.editFormGroup.get('sellerLocationFC').value;
    this.sellerDetails.Pin = this.editFormGroup.get('sellerPinCodeFC').value;
    this.sellerDetails.Stcd = this.editFormGroup.get('sellerStateCodeFC').value;
    this.sellerDetails.Ph = this.editFormGroup.get('sellerPhoneFC').value;
    this.sellerDetails.Em = this.editFormGroup.get('sellerEmailFC').value;
    this.editRequest.sellerDetails = this.sellerDetails;

    this.buyerDetails.Gstin = this.editFormGroup.get('buyerGstinFC').value;
    this.buyerDetails.LglNm = this.editFormGroup.get('buyerLegalNameFC').value;
    this.buyerDetails.TrdNm = this.editFormGroup.get('buyerTradeNameFC').value;
    this.buyerDetails.Addr1 = this.editFormGroup.get('buyerAddressLine1FC').value;
    this.buyerDetails.Addr2 = this.editFormGroup.get('buyerAddressLine2FC').value;
    this.buyerDetails.Addr3 = this.editFormGroup.get('buyerAddressLine3FC').value;
    this.buyerDetails.Loc = this.editFormGroup.get('buyerLocationFC').value;
    this.buyerDetails.Pin = this.editFormGroup.get('buyerPinCodeFC').value;
    this.buyerDetails.Stcd = this.editFormGroup.get('buyerStateCodeFC').value;
    this.buyerDetails.Ph = this.editFormGroup.get('buyerPhoneFC').value;
    this.buyerDetails.Em = this.editFormGroup.get('buyerEmailFC').value;
    this.buyerDetails.Pos = this.editFormGroup.get('buyerPlaceOfSupplyFC').value;
    this.editRequest.buyerDetails = this.buyerDetails;

    this.editRequest.b2C = this.b2cflag;



    if (this.wmsCheck) {
      this._spinner.show();
      this._service.updateWmsEinvoice(this.editRequest).subscribe(
        Response => {
          this._toastr.success(Response);
          this.goToSearch();
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        }
      )
    }
    if (this.creditCheck) {
      this._spinner.show();
      this._service.updateCreditEinvoice(this.editRequest).subscribe(
        Response => {
          this._toastr.success(Response);
          this.goToSearch();
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        }
      )
    }

    if(this.cmdmCheck) {
      this._spinner.show();
      this._service.updateCmdmEinvoice(this.editRequest).subscribe(
        Response => {
          this._toastr.success(Response);
          this.goToSearch();
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        }
      )
    }

    if(this.alliedCheck) {
      this._spinner.show();
      this._service.updateAlliedEinvoice(this.editRequest).subscribe(
        Response => {
          this._toastr.success(Response);
          this.goToSearch();
          this._spinner.hide();
        },
        error => {
          this._spinner.hide();
          this.handleStringError(error);
        }
      )
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

}
