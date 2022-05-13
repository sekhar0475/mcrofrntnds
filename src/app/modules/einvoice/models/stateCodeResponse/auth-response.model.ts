import { authResponseData } from './auth-response-data.model';

export interface authResponse {
    message: string,
    data: authResponseData,
    status: string
}