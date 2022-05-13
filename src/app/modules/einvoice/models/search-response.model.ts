import { buyerDetails } from './buyer-details.model';
import { sellerDetails } from './seller-details.model';

export interface EInvoiceSearchResponse {
    documentId: number,
    documentNumber: string,
    documentDate: Date,
    parentBillNumber: string,
    customerName: string,
    customerMsaCode: string,
    address1: string,
    address2: string,
    address3: string,
    location: string,
    pincode: number,
    stateCode: string,
    irnStatus: string,
    igst: number,
    cgst: number, 
    sgst: number,
    
    errorMessage: string,

    
    buyerDetails: buyerDetails,
    sellerDetails: sellerDetails,
    baseAmount: number
    
    // b2C: boolean,




}