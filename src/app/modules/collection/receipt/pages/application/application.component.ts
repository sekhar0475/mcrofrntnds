import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceiptService } from '../../services/receipt.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReceiptDetailsWithId } from '../../models/receiptDetailsById.model';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {
  selectedId: number;
  fileToUpload: File = null;
  receiptById: ReceiptDetailsWithId;
  availFreightAmt: number;
  availTdsAmt: number;
  availGstTdsAmt: number;
  unapplicationFlag = false;
  displayApplnBills = false;

  constructor(
    private route: ActivatedRoute,
    private _receiptService: ReceiptService,
    public _toastr: ToastrService,
    private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.loadData();
  }

  // attachment from header file
  getFileToUpload(file: File) {
    this.fileToUpload = file;
  }

  // to get the data from the service for receipt by id
  loadData() {
    this.selectedId = this.route.snapshot.params.id;
   // this._spinner.show();
    this._receiptService.getReceiptDataById(this.selectedId, this.unapplicationFlag).subscribe(
      response => {
       // this._spinner.hide();
        this.receiptById = response;
        this.availFreightAmt = this.receiptById.outstandingFrtAmt;
        this.availGstTdsAmt = this.receiptById.outstandingGstTdsAmt;
        this.availTdsAmt = this.receiptById.outstandingTdsAmt;
        this.receiptById.allowAttachment = true;
        this.displayApplnBills = true;
      },
      error => {
      //  this._spinner.hide();
        console.log(error);
        if (error.error != null && error.error.errorCode != null) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }

}
