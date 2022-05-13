import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Users } from '../models/users.model';
import { Role } from '../../role/models/role.model';
import { UserDto } from '../models/user-dto.model';
import { UserRoleDto } from '../models/user-role-dto.model';
import { UserBranchDto } from '../models/user-branch-dto.model';
import { AdServiceDto } from '../models/ad-service-dto.model';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

constructor(private client: HttpClient,
            private constants: ConstantsService) { }
  getAllUsers() {
    const url = this.constants.GET_ALL_USERS;
    return (this.client.get<Users[]>(url));
    }

  getAllRoles() {
    const url = this.constants.GET_ALL_ROLES;
    return (this.client.get<Role[]>(url));
    }

  getAllUserRolesById(userId: number) {
    const url = this.constants.GET_USER_ROLES;
    return (this.client.get<UserRoleDto[]>(url + userId));
  }

  getUserById(userId: number) {
    const url = this.constants.GET_BY_USER_ID;
    return (this.client.get<Users>(url + userId));
  }

  postUserData(reqData: UserDto) {
    const url = this.constants.POST_USER_DATA;
    return (this.client.post<void>(url, reqData));
  }

  getAllBranches() {
    const url = this.constants.GET_ALL_BOOKING_BRANCH;
    return (this.client.get<any>(url));
  }

  getPrevBranchesByUserMasterId(userId: number) {
    const url = this.constants.GET_PRIVILEGE_BRANCH;
    return (this.client.get<UserBranchDto[]>(url + userId));
  }

  getBranchById(brId) {
    const url = this.constants.GET_BOOKING_BRANCH;
    return (this.client.get<any>(url + brId));
  }

  getWildCardBranchName(branchName) {
    const url = this.constants.GET_BOOKING_BRANCH;
    return (this.client.get<any>(url + branchName));
  }

  getBranchBySearchCritera(searchCriteria, criteriaValue) {
    const url = this.constants.GET_BOOKING_BRANCH;
    return (this.client.get<any>(url + searchCriteria + '/' + criteriaValue));
  }

  getAllBranchTypes() {
    const url = this.constants.GET_BOOKING_BRANCH + 'branchTypes';
    return (this.client.get<any>(url));
  }

  getBranchByType(branchTypeId) {
    const url = this.constants.GET_BOOKING_BRANCH + 'branchType/' + branchTypeId;
    return (this.client.get<any>(url));
  }



  getDefBranchesByUserMasterId(userId: number) {
    const url = this.constants.GET_USER_DEFAULT_BRANCH;
    return (this.client.get<UserBranchDto>(url + userId));
  }

 
  getADServiceUserData(userId: number) {
    const url = this.constants.VALIDATE_AD_SERVICE;
    return (this.client.get<AdServiceDto>(url + userId));
  }

  validateuser(userId: string) {
    const url = this.constants.VALIDATE_AD_SERVICE;
    return timer(0)
      .pipe(
        switchMap(() => {
          return this.client.get<AdServiceDto>(url + userId);
        })
      );
  }

}
