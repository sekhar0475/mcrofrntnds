import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-receipt-cancellation',
  templateUrl: './receipt-cancellation.component.html',
  styleUrls: ['./receipt-cancellation.component.scss']
})
export class ReceiptCancellationComponent implements OnInit {

  receiptCancellation = true;
  constructor() { }

  ngOnInit() {
  }

}
