import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role } from '../models/role.model';
import { Module } from '../models/module.model';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private client: HttpClient,
              private constants: ConstantsService) { }
  // get role details
  getRoles(roleId) {
    return (this.client.get<Role[]>(`${this.constants.GET_ROLE_BY_ID}` + roleId));
  }
  // get modules
  getAllModules() {
    return (this.client.get<Module[]>(`${this.constants.GET_MODULES}`));
  }
  // post role information
  postRoleData(reqData: Role) {
    console.log(reqData);
    return (this.client.post<void>(`${this.constants.POST_ROLES_PERMISSONS}`, reqData));
  }
}
