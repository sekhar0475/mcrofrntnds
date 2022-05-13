import { BranchDataModel } from "./branch-data-model";

export interface BranchDetailsModel {

    data: BranchDataModel;
    status: string;
    message: string;
}