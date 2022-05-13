export interface SubmitJobRequest {
    criteria: ReportCriteria;
    isLongOps: boolean;
    outputFormat: string;
    reportType: String;
}