import { AbstractControl } from '@angular/forms';

//validations for gstin
export function gstinValidator(control: AbstractControl) {
    const Gstin = control.value;
    if (Gstin != null && Gstin.length !== 15 ) {
        return { GstinInvalid : true};
    }
    return null;
}
export function gstinPatternValidator(control: AbstractControl) {
    const Gstin = control.value;
    let regexGstin = RegExp('[0-9]{2}[0-9A-Z]{13}')
    if(!regexGstin.test(Gstin)) {
        return { GstinPatternInvalid : true};
    }
    return null;
}
export function buyerGstinPatternValidator(control: AbstractControl) {
    const Gstin = control.value;
    let regexGstin = RegExp('^(([0-9]{2}[0-9A-Z]{13})|URP)$')
    if(!regexGstin.test(Gstin)) {
        return { buyerGstinPatternInvalid : true};
    }
    return null;
}

//validations for legal name
export function legalNameValidator(control: AbstractControl) {
    const legalName = control.value;
    if (legalName != null && (legalName.length < 3 || legalName.length > 100)) {
        return { legalNameInvalid : true};
    }
    return null;
}
export function legalNamePatternValidator(control: AbstractControl) {
    const legalName = control.value;
    let regexGstin = RegExp('^([^\\\"])*$')
    if(!regexGstin.test(legalName)) {
        return { legalNamePatternInvalid : true};
    }
    return null;
}


//trade name validators
export function tradeNameValidator(control: AbstractControl) {
    const tradeName = control.value;
    if(tradeName == ''){
        return null;
    }
    if (tradeName != null && (tradeName.length < 3 || tradeName.length > 100)) {
        return { tradeNameInvalid : true};
    }
    return null;
}
export function tradeNamePatternValidator(control: AbstractControl) {
    const tradeName = control.value;
    let regexGstin = RegExp('^([^\\\"])*$')
    if(!regexGstin.test(tradeName)) {
        return { tradeNamePatternInvalid : true};
    }
    return null;
}

//address 1 validators
export function address1Validator(control: AbstractControl) {
    const address1 = control.value;
    if (address1 != null && (address1.length < 1 || address1.length > 100)) {
        return { address1Invalid : true};
    }
    return null;
}
export function addressPatternValidator(control: AbstractControl) {
    const address1 = control.value;
    let regexGstin = RegExp('^([^\\\"])*$')
    if(!regexGstin.test(address1)) {
        return { addressPatternInvalid : true};
    }
    return null;
}


//addres 2 validator
export function address2Validator(control: AbstractControl) {
    const address2 = control.value;
    if(address2 == ''){
        return null;
    }
    if (address2 != null && (address2.length < 3 || address2.length > 100)) {
        return { address2Invalid : true};
    }
    return null;
}

//location validators
export function locationValidator(control: AbstractControl) {
    const location = control.value;
    if (location != null && (location.length < 3 || location.length > 50)) {
        return { locationInvalid : true};
    }
    return null;
}

//pin code validators
export function pinValidator(control: AbstractControl) {
    const pin = control.value;
    if (pin != null && (pin < 100000 || pin > 999999)) {
        return { pinInvalid : true};
    }
    return null;
}

//state code validators
export function stateCodeValidator(control: AbstractControl) {
    const stateCode = control.value;
    if (stateCode != null && (stateCode.length < 1 || stateCode.length > 2)) {
        return { stateCodeInvalid : true};
    }
    return null;
}
export function stateCodePatternValidator(control: AbstractControl) {
    const stateCode = control.value;
    let regexGstin = RegExp('^(?!0+$)([0-9]{1,2})$')
    if(!regexGstin.test(stateCode)) {
        return { stateCodePatternInvalid : true};
    }
    return null;
}


//pos validators
export function placeOfSupplyValidator(control: AbstractControl) {
    const placeOfSupply = control.value;
    if (placeOfSupply != null && (placeOfSupply.length < 1 && placeOfSupply.length > 2)) {
        return { placeOfSupplyInvalid : true};
    }
    return null;
}

export function placeOfSupplyPatternValidator(control: AbstractControl) {
    const placeOfSupply = control.value;
    let regexGstin = RegExp('^([^\\\"])*$')
    if(!regexGstin.test(placeOfSupply)) {
        return { placeOfSupplyPatternInvalid : true};
    }
    return null;
}

//phone validators
export function phoneValidator(control: AbstractControl) {
    const phone = control.value;
    if(phone == ''){
        return null;
    }
    if (phone != null && (digits_count(phone) < 6 || digits_count(phone) > 12)) {
        return { phoneInvalid : true};
    }
    return null;
}
export function phonePatternValidator(control: AbstractControl) {
    const phone = control.value;
    let regexGstin = RegExp('^([0-9]{6,12})$')
    if(!regexGstin.test(phone)) {
        return { phonePatternInvalid : true};
    }
    return null;
}

//email validators
export function emailValidator(control: AbstractControl) {
    const email = control.value;
    if (email != null && (email.length < 6 || email.length > 100)) {
        return { emailInvalid : true};
    }
    return null;
}
export function emailPatternValidator(control: AbstractControl) {
    const email = control.value;
    let regexGstin = RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')
    if(!regexGstin.test(email)) {
        return { emailPatternInvalid : true};
    }
    return null;
}

    
//function to count digits
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