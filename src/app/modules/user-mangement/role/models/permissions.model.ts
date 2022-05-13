export interface RolePermissions {
    roleId: number;
    moduleAssignId: number;
    moduleId: number;
    submoduleId: number;
    readFlag: string;
    writeFlag: string;
    updFlag: string;
    expDt: Date;
    effectiveDt: Date;
}
