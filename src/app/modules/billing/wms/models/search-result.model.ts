export interface SearchResult {
    billBr: string,
    billToAddr: string,
    collBr: string,
    submsnBr: string,
    pymtTerm: string,
    contractEndDate: string,
    billId: number;
    ttlTaxAmt: number;
	cgstAmt: number;
	igstAmt: number;
    sgstAmt: number;
    collBrId : number;
    billBrId : number;
    gstApplied : string;
    billingLevelId : number;
}
