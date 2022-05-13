import { UserRoleAssignments } from './user-role-assignments.model';
import { UserBranchAssignments } from './user-branch-assignments.model';

export interface UserDto {
  userMasterId: number;
  userId: number;
  username: string;
  mobile: string;
  email: string;
  status: string;
  departmentId: number;
  departmentName: string;
  expDt: Date;
  crDt: Date;
  crBy: string;
  updDt: Date;
  updBy: string;
  attr1: string;
  attr2: string;
  attr3: string;
  attr4: string;
  attr5: string;
  userRoleAssignmentList: UserRoleAssignments[];
  userBranchAssignmentList: UserBranchAssignments[];
}
