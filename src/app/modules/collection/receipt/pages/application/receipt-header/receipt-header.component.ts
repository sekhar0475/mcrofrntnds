import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiptDetailsWithId } from '../../../models/receiptDetailsById.model';

@Component({
  selector: 'app-receipt-header',
  templateUrl: './receipt-header.component.html',
  styleUrls: ['./receipt-header.component.scss']
})
export class ReceiptHeaderComponent implements OnInit {
  fileToUpload: File = null;
  availFreightAmt: number;
  availTdsAmt: number;
  availGstTdsAmt: number;

  @Input()
  public receiptById: ReceiptDetailsWithId;
  // attchment from header
  @Output() receiptHeaderAttachment: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  // on attchment file added
  handleFileInput(files: FileList) {
    this.pickFileToUpload(files.item(0));
  }
  // emits the attchment to application parent component
  pickFileToUpload(headerFile: any) {
    this.receiptHeaderAttachment.emit(headerFile);
  }
}

