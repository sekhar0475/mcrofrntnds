export interface UserBranchDto {
  userBrAssignId: number;
  branchId: number;
  branchName: string;
  branchCode: string;
  type: string;
  address : string;
  effectiveDt: Date;
  expDt: Date;
}
