import { buyerDetails } from './buyer-details.model';
import { sellerDetails } from './seller-details.model';

export interface Details{
    documentId: number,
    documentNum: string,
    documentDate: Date,
    buyerDetails: buyerDetails,
    sellerDetails: sellerDetails

  
}
