import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EbillSearchRequest } from '../../models/ebill-search-request.model';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDatepicker } from '@angular/material';
import { BranchDialogComponent } from '../branch-dialog/branch-dialog.component';
import * as _moment from 'moment';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
// tslint:disable-next-line:no-duplicate-imports
//import {default as _rollupMoment, Moment} from 'moment';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import * as moment from 'moment';

//const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-ebill-search',
  templateUrl: './ebill-search.component.html',
  styleUrls: ['./ebill-search.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class EbillSearchComponent implements OnInit {
  
  createFormGroup: FormGroup;
  isSearched : boolean = false;
  searchRequest : EbillSearchRequest = {
    billMonth : null,
    submissionBranchId : null,
    sfxCode : null
  };
  submissionBranchId : number;
  constructor(private _datePipe : DatePipe,private _dialog: MatDialog) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      billMonthFc: new FormControl(moment()),
      submissionBranchFC: new FormControl(''),
      sfxCodeFc: new FormControl(''),
      
    });
  }

  submit(){    
    const newSearchParams = {} as EbillSearchRequest;
    newSearchParams.billMonth = this._datePipe.transform(this.createFormGroup.get('billMonthFc').value, 'MM/yyyy') ;
    newSearchParams.submissionBranchId = this.submissionBranchId;
    newSearchParams.sfxCode = (this.createFormGroup.get('sfxCodeFc').value === '') ? null : this.createFormGroup.get('sfxCodeFc').value;
    this.searchRequest = newSearchParams;
    this.isSearched = true;    
    console.log(this.searchRequest);

  }

  openSubMsnBranchesDialog() {
      console.log('opening');
      const dialogRef = this._dialog.open(BranchDialogComponent, {
        // data: {
        //   dataKey: this.creditCustDetails,
        //   openFrom: "submsnBranch",
        //   billType: this.selectedBillType
        // }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result[0] != null) {
            console.log(result);
            this.submissionBranchId = result[0].branchId;
            this.createFormGroup.controls.submissionBranchFC.setValue("    " + result[0].branchName);

          }
        }
      }
      );
  }
 // date = new FormControl(moment());
  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValueYear = this.createFormGroup.get('billMonthFc').value;
    ctrlValueYear.year(normalizedYear.year());
    this.createFormGroup.controls.billMonthFc.setValue(ctrlValueYear);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
   
    const ctrlValueMonth = this.createFormGroup.get('billMonthFc').value;
    ctrlValueMonth.month(normalizedMonth.month());
   
    this.createFormGroup.controls.billMonthFc.setValue(ctrlValueMonth);
    datepicker.close();
  }
}
