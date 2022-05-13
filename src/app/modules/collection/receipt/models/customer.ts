import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';

export interface Customer {
    aliasName: string;
	billConfigId: number;
	billingLevel: string;
	billingLevelValue: string;
	collectionBranchId: number;
	custId: number;
	custName: string;
	tanNumber: string;
}
