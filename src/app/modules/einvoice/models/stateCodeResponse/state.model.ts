import { country } from "./country.model";

export interface state {
    id: string,
    attr1: string,
    descr: string,
    ewayblInterTh: number,
    ewayblIntraTh: number,
    gstNum: string,
    gstStateCode: number,
    lkpStateTypeId: number,
    stateName: string,
    status: number,
    countryId: number,
    effectiveDt: string,

    country: country
}