import { WayBillsData } from './waybill-response.model';

export interface WayBillResults {
  batchId: number;
  waybills: WayBillsData[];
}
