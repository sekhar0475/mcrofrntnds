export interface ReportDetail {
    custname: string;
    batchNum: number;
    billNum: string;
    msa: string;
    sfx: string;
    rateCard: string;
    frgtAmount: string;
    cgstAmt: string;
	igstAmt: string;
	sgstAmt: string;
    taxAmount: string;
    invoiceAmount: string;
    blngCycle: string;
    blngBranch: string;
    submsnBranch: string;
    collBranch: string;
    blngBy: string;
    wayBillCount: number;
}
