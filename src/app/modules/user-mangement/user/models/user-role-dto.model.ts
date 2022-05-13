export interface UserRoleDto {
  userRoleAssignId: number;
  roleId: number;
  roleName: string;
  description: string;
  status: string;
  effectiveDt: Date;
  expDt: Date;
}
