import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { dialogData } from '../../models/sucess-data-model';

@Component({
  selector: 'app-confirmation-success-dialog',
  templateUrl: './confirmation-success-dialog.component.html',
  styleUrls: ['./confirmation-success-dialog.component.scss']
})
export class ConfirmationSuccessDialogComponent {
  form: FormGroup;
  value: string;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: dialogData,
    private _router: Router
  ) {
    this.value = this.data.value;
    this.initInterval();
  }

  initInterval() {
    setTimeout(() => {
      this.dialogRef.close();
    }, 15000);
  }
}
