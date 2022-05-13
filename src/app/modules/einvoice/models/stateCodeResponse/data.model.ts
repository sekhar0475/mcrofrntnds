import { city } from "./city.model";
import { pinCodeFeature } from "./pinCode-feature.model";
export interface data {
    id: number,
    lkpSafextTypeId: number,
    pincode: string,
    status: number,
    localAreaName: string,
    effectiveDt: string,

    pinCodeFeature: pinCodeFeature,
    city: city
}