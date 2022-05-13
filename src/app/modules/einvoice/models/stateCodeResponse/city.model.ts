import { district } from "./district.model";

export interface city {
    id: number,
    cityCode: string,
    cityName: string,
    status: number,
    effectiveDt: string

    district: district
}