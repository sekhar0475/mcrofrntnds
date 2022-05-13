import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoice-write-off',
  templateUrl: './invoice-write-off.component.html',
  styleUrls: ['./invoice-write-off.component.scss']
})
export class InvoiceWriteOffComponent implements OnInit {

  invoiceWriteOff = true;

  constructor() { }

  ngOnInit() {
  }

}
