import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})

export class ConfirmationDialogComponent {
  form: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) { 
      this.initInterval();
    }
  onNoClick(): void {
    this.dialogRef.close();
  }

  initInterval() {
    setTimeout(() => {
         this.dialogRef.close();
       }, 15000);
    }

  saveMessage(){
  }
}
