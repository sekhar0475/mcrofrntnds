import { ReportRequestCriteria } from "./report-criteria.model";

export interface ReportAnnexureRequest {
    criteria: ReportRequestCriteria;
    isLongOps: boolean;
    outputFormat: string;
    reportType: String;
}