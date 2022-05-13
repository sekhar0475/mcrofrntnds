import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

interface BillTypeList {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-gstr-reports',
  templateUrl: './gstr-reports.component.html',
  styleUrls: ['./gstr-reports.component.scss']
})
export class GstrReportsComponent implements OnInit {
  invoiceTypeList: BillTypeList[] = [];
  createFormGroup: FormGroup;
  toDateValue: Date;

  constructor() { }
  ngOnInit() {
    this.initForm();
    this.invoiceTypeList = [{ value: 'ALL', viewValue: 'ALL' }, { value: 'CREDIT', viewValue: 'CREDIT' }, { value: 'RETAIL', viewValue: 'RETAIL' }];

  }

  initForm() {
    this.createFormGroup = new FormGroup({
      invoiceTypeFC: new FormControl('', [Validators.required]),
      billPeriodfromFC: new FormControl('', [Validators.required]),
      billPeriodtoFC: new FormControl('', [Validators.required]),
      
    });
  }

  submit(){

  }

  setDateValue(selectedDate) {
    console.log(selectedDate);
    this.toDateValue = selectedDate.value;
  }


}
