import { data } from "./data.model";
import { stateCodeStatus } from "./stateCode-status.model";


export interface stateCodeResponse {
    data: data[],
    status: stateCodeStatus
}