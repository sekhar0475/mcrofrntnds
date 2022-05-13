import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DiscountSearch } from '../../models/discount-search.model';

@Component({
  selector: 'app-discount-search',
  templateUrl: './discount-search.component.html',
  styleUrls: ['./discount-search.component.scss']
})
export class DiscountSearchComponent implements OnInit {

  searchFormGroup: FormGroup; // search form group
  @Input() public discountSearchValues: DiscountSearch = {} as DiscountSearch;
  @Output() discountSearchVal: EventEmitter<any> = new EventEmitter<any>();

  childValues: DiscountSearch[] = [];
  constructor() { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.searchFormGroup = new FormGroup({
      batchNumberFc: new FormControl('', [Validators.required]),
    });
  }
  // to push search values to parent component
  pickSearchData(searchData: any) {
    this.discountSearchVal.emit(searchData);
  }

  // to set the emitter values to parent
  pushValues() {
    this.pickSearchData(this.discountSearchValues);
  }
}
