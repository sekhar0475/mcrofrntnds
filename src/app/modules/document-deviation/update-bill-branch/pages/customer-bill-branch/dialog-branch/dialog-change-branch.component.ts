import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DocumentBranch } from 'src/app/modules/document-deviation/doc-search-upload/models/document-branch.model';
// tslint:disable-next-line: max-line-length
import { DocumentBranchComponent } from 'src/app/modules/document-deviation/doc-search-upload/pages/document-branch/document-branch.component';
import { DocumentSearchUploadService } from 'src/app/modules/document-deviation/doc-search-upload/services/document-search-upload.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { BillBranchData } from '../../../models/update-bill-branch.model';
import { UpdateBillBranchService } from '../../../services/update-bill-branch.service';



@Component({
  selector: 'app-dialog-change-branch',
  templateUrl: './dialog-change-branch.component.html',
  styleUrls: ['./dialog-change-branch.component.scss']
})
export class DialogChangeBranchComponent implements OnInit {
  submsnBrId = null;
  collectionBrId = null;
  altColBrId = null;
  createFormGroup: FormGroup;
  billType = null;
  docBranchList: DocumentBranch[] = [];
  selectedBillBranch: BillBranchData[] = [];
  updatedBillBranchArry: BillBranchData[] = [];
  errorMessage: ErrorMsg;

  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _updateBillBranchService: UpdateBillBranchService,
    private _documentSearchUploadService: DocumentSearchUploadService,
    @Inject(MAT_DIALOG_DATA) public data: BillBranchData[],
    public dialogRef: MatDialogRef<DialogChangeBranchComponent>
  ) {
    dialogRef.disableClose = true;
    this.billType = data['billType']; // bill type
    this.selectedBillBranch = data['selectedBillBranch']; // selected data in update component
  }

  ngOnInit() {
    this.initForm();
    this.setBranchDetails();
  }

  // for page validations
  initForm() {
    this.createFormGroup = new FormGroup({
      submsnBrFc: new FormControl(''),
      collectionBrFc: new FormControl(''),
      altColBrFc: new FormControl('')
    });
  }
  // branch API
  setBranchDetails() {
    this.docBranchList = [];
    this._spinner.show();
    this._documentSearchUploadService.getBranchDetails().subscribe(
      response => {
        this._spinner.hide();
        this.docBranchList = response['data'];
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }
  // errors function
  handleError(error: any) {
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

  // for submission branch search
  submissonBrSearch() {
    const dialogRef = this._dialog.open(DocumentBranchComponent, { data: this.docBranchList });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          this.createFormGroup.controls.submsnBrFc.setValue(result[0].branchName);
          this.submsnBrId = result[0].branchId;
        }
      }
    });
  }
  // for collection branch search
  collectionBrSearch() {
    const dialogRef = this._dialog.open(DocumentBranchComponent, { data: this.docBranchList });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          this.createFormGroup.controls.collectionBrFc.setValue(result[0].branchName);
          this.collectionBrId = result[0].branchId;
        }
      }
    });
  }
  // for alternative collection branch search
  alternativeBrSearch() {
    const dialogRef = this._dialog.open(DocumentBranchComponent, { data: this.docBranchList });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result[0] != null) {
          this.createFormGroup.controls.altColBrFc.setValue(result[0].branchName);
          this.altColBrId = result[0].branchId;
        }
      }
    });
  }

  // to save data to database
  submit() {
    this.dataValidation();
    if (!this._toastr.currentlyActive) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        data: 'Do you want continue with Update Bill Branch?'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog sent: ${result}`);
        if (result) {
          this.postBillBranchData();
        } else {
          // do nothing.
        }
      });
    }
  }

  // validations for branch data
  dataValidation() {
    this.updatedBillBranchArry = [];
    this.selectedBillBranch.forEach(data => {
      this.updatedBillBranchArry.push({
        billId: data.billId,
        billNumber: data.billNumber,
        blngLevelId: data.blngLevelId,
        blngLevelValue: data.blngLevelValue,
        customerName: data.customerName,
        submsnBrId: data.submsnBrId,
        submsnBrName: data.submsnBrName,
        status: data.status,
        colBrId: data.colBrId,
        colBrName: data.colBrName,
        altrBrId: data.altrBrId,
        altrBrName: data.altrBrName,
        updSubmsnBrId: this.submsnBrId,
        updSubmsnBrName: this.createFormGroup.get('submsnBrFc').value,
        updColBrId: this.collectionBrId,
        updColBrName: this.createFormGroup.get('collectionBrFc').value,
        updAltrBrId: this.altColBrId,
        updAltrBrName: this.createFormGroup.get('altColBrFc').value
      });
    });
    console.log(this.updatedBillBranchArry);
    if (this.collectionBrId == null && this.submsnBrId == null && this.altColBrId == null) {
      this._toastr.warning('Atleast Change one branch before Submit');
    }
  }

  // post data to database
  postBillBranchData() {
    if (this.updatedBillBranchArry.length > 0) {
      this._spinner.show();
      this._updateBillBranchService.postBillBranchData(this.updatedBillBranchArry, this.billType).subscribe(
        response => {
          this._spinner.hide();
          this._toastr.success(response);
          this.dialogRef.close();
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    }
  }
}
