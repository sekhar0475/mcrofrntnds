import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
     name: 'customDate'
   })
   export class CustomDatePipe extends
                DatePipe implements PipeTransform {
     transform(value: any, args?: any): any {
      if (value != undefined) {
        value = value.substring(0, 10);
      }
      return super.transform(value, 'd-MMM-y');
     }
   }
