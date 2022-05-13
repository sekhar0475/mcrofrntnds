import { buyerDetails } from './buyer-details.model';
import { sellerDetails } from './seller-details.model';

export interface editRequest {
  
    documentId: number;
    documentNumber: string;
    documentDate: Date;
    buyerDetails: buyerDetails;
    sellerDetails: sellerDetails;      
    b2C: boolean;
}