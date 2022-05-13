export interface ReportJobRequest {
    jobId: string;
    parentJobId: string;
    jobType: string;
    status: string;
    fromDateTime: string;
    toDateTime: string;
}
