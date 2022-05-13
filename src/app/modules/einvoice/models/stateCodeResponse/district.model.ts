import { state } from "./state.model";

export interface district {
    id: number,
    districtName: string,
    status: number,
    effectiveDt: string,

    state: state
}