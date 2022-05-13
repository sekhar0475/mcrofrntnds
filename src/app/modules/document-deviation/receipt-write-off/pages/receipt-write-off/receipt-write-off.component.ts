import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-receipt-write-off',
  templateUrl: './receipt-write-off.component.html',
  styleUrls: ['./receipt-write-off.component.scss']
})
export class ReceiptWriteOffComponent implements OnInit {

  // intial route
  receiptWriteOff = true;

  constructor() { }

  ngOnInit() {
  }

}
