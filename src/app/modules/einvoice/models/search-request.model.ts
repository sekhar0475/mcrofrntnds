export interface EInvoiceSearchRequest {
    documentNum: string,
    documentType: string,
    fromDate: Date,
    toDate: Date,
    buyerGstin: string,
    status: string,
    batchNum: string
}