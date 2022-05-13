import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { FinalizeSearch } from '../../models/finalize-search.model';

@Component({
  selector: 'app-finalize-search',
  templateUrl: './finalize-search.component.html',
  styleUrls: ['./finalize-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class FinalizeSearchComponent implements OnInit {
  createFormGroup: FormGroup;
  // to set the values of text fields
  @Input() public searchValues: FinalizeSearch = {} as FinalizeSearch;
  @Output() finalizeSearchVal: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
  ngOnInit() {
    this.initForm();
  }

  // emits the data from child to parent table for search
  pickSearchData(searchData: any) {
    this.finalizeSearchVal.emit(searchData);
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      fromDateFc: new FormControl(''),
      toDateFc: new FormControl(''),
    });
  }

  // to set the emitter values to parent
  pushValues() {
    this.pickSearchData(this.searchValues);
  }
}
