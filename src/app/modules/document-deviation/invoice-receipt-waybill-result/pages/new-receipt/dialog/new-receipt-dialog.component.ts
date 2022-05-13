import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-new-receipt-dialog',
  templateUrl: './new-receipt-dialog.component.html',
  styleUrls: ['./new-receipt-dialog.component.scss']
})
export class NewReceiptDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<NewReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) {
    dialogRef.disableClose = true;
  }
  saveMessage() {

  }


}

