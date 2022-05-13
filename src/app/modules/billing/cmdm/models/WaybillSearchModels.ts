export interface WaybillSearchRequest {
  documentnumber: string;
}

export interface WaybillModel {
   baseAmount: number;
	 billToAddr: string;
   billToCustomer: string;
	 billToEmail: string;
   billToLocation: string;
	 billToPincode: string;
	 bkgBr: string;
	 bkgBrId: number;
	 blngCycle: string;
	 cgstAmount: number;
	 city: string;
	 consigneeId: number;
   consigneeName: string;
	 consignerId: number;
	 consignerName: string;
	 country: string;
	 creationDate: Date;
   delieveryDate: Date;
   deliveryBr: string;
   deliveryBrId: number;
	 destination: string;
	 documentType: string;
	 gstNum: string;
	 igstAmount: number;
	 outstandingAmount: number;
	 pickupDate: Date;
 	 prcCode: string;
   prcId: number;
	 pymtTerm: string;
	 sgstAmount: number;
	 state: string;
 	 stateCode: string;
	 ttlTaxAmount: number;
	 waybillId: number;
	 waybillNumber: string;
}


