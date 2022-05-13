import { NativeDateAdapter } from '@angular/material';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })


export class PickDateAdapter extends NativeDateAdapter {

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow') {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  }
 
  format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            return formatDate(date, 'dd-MMM-yyyy', this.locale);
        }if (displayFormat === 'inputmonth') {
          return formatDate(date, 'MMMM yyyy', this.locale);
        } else {
            return date.toDateString();
        }
    }
  }

export const PICK_FORMATS = {
    parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
    display: {
        dateInput: 'input',
        monthYearLabel: 'inputmonth',
        dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
        monthYearA11yLabel: {year: 'numeric', month: 'long'}
    }
  };

