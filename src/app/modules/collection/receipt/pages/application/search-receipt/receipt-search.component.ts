import { Component, OnInit, Input, Output , EventEmitter } from '@angular/core';
import { ReceiptSearch } from '../../../models/receiptSearch.model';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';


@Component({
  selector: 'app-receipt-search',
  templateUrl: './receipt-search.component.html',
  styleUrls: ['./receipt-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class ReceiptSearchComponent implements OnInit {

  @Input()
  public searchValues: ReceiptSearch = {} as ReceiptSearch;
  @Output() receiptSearchVal: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    // set the search dates default for page load.
    const dte = new Date();
    this.searchValues.toDate = new Date();
    dte.setDate(dte.getDate() - 7);
    this.searchValues.fromDate = dte;
    this.receiptSearchVal.emit(this.searchValues);
  }

  // emits the data from child to parent table for search
  pickSearchData(searchData: any) {
    this.receiptSearchVal.emit(searchData);
  }

  // to set the emitter values to parent
  pushValues() {
    this.pickSearchData(this.searchValues);
  }

}
