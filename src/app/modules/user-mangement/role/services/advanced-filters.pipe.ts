import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'advancedFilters'
})
export class AdvancedFiltersPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!args) {
      return value;
    }
    const y: number = + args[0];
    return value.filter(items => items.moduleId === y);
  }
}
