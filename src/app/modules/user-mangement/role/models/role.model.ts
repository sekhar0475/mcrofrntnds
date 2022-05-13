import { RolePermissions } from './permissions.model';

export interface Role {

    roleId: number;
    roleName: string;
    desc: string;
    status: string;
    expDt: Date;
    effectiveDt: Date;
    rolePermissionDTOList: RolePermissions[];
}



