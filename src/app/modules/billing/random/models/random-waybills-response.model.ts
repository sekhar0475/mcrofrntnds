import { PropelErrorModel } from "src/app/shared/models/propel-i-error.model";
import { RandomWaybillsData } from "./random-waybills-data.model";
import { RandomWbBlngDetailsResp } from "./random-wbblng-details-resp.model";

export interface RandomWaybillResponse {
    data: RandomWbBlngDetailsResp;
    status: string;
    message: string;
    errors: PropelErrorModel[];
}