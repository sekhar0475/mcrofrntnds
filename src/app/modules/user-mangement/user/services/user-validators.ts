
import { AbstractControl } from '@angular/forms';

export function mobileNumberValidator(control: AbstractControl) {
    const mobileNumber = control.value;
    if (mobileNumber != null && digits_count(mobileNumber) !== 10) {
        return { mobileValid : true};
    }
    return null;
}

function digits_count(n) {
    let count = 0;
    if (n >= 1) {
        ++count;
    }
    while (n / 10 >= 1) {
      n /= 10;
      ++count;
    }
    return count;
  }
