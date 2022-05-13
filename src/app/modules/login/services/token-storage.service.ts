import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserModules } from '../model/user-modules';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { BroadCastMsg } from 'src/app/shared/models/broadcast-msg.model';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor(
     private _router: Router,
     private _client: HttpClient,
     private _constants: ConstantsService) { }

  // Get Access Token
  public getAccessToken(): Observable<string> {
    const token: string = sessionStorage.getItem('accessToken') as string;
    return of(token);
  }

  // Set access token
  public setAccessToken(accessToken: string): TokenStorageService {
    sessionStorage.setItem('accessToken', accessToken);
    return this;
  }


  // Set Current User
  public setCurrentUser(user: string): TokenStorageService {
    sessionStorage.setItem('currentUser', user);
    return this;
  }

  // Set Current User Name
  public setCurrentUserName(userName: string): TokenStorageService {
    sessionStorage.setItem('currentUserName', userName);
    return this;
  }

  // Get Current User
  public getCurrentUser(): Observable<string> {
    const token: string = sessionStorage.getItem('currentUser') as string;
    return of(token);
  }

  // Get Current User Name
  public getCurrentUserName(): Observable<string> {
    const token: string = sessionStorage.getItem('currentUserName') as string;
    return of(token);
  }

  public clear() {
    sessionStorage.clear();
    localStorage.clear();
  }


  // Session storage for bulk data.
  public setUserModules(userModules: any[]) {
    sessionStorage.setItem('userModules', JSON.stringify(userModules));
  }

  // filter co branch Delhi-10
  public getUserModules(): any {
    if(sessionStorage.getItem('branchCode') === 'DLI10') {
      return JSON.parse(sessionStorage.getItem('userModules'));
    } else {
     const userModules = JSON.parse(sessionStorage.getItem('userModules'));
      const result = userModules.filter(element => {
        return element.moduleName !== 'Administration';
      });
      return result;
    }
}

  // set permissions
  public setCurrentModuleReadFlag(readFlag: string) {
    sessionStorage.setItem('readFlag', readFlag);
  }

  public setCurrentModuleWriteFlag(writeFlag: string) {
    sessionStorage.setItem('writeFlag', writeFlag);
  }

  public setCurrentModuleUpdateFlag(updateFlag: string) {
    sessionStorage.setItem('updateFlag', updateFlag);
  }
  // get permissions
  public getCurrentModuleReadFlag(): string {
    return sessionStorage.getItem('readFlag');
  }

  public getCurrentModuleWriteFlag(): string {
    return sessionStorage.getItem('writeFlag');
  }

  public getCurrentModuleUpdateFlag(): string {
    return sessionStorage.getItem('updateFlag');
  }
  // get user branch id
  public getUserBranch(): string {
    const branchId = sessionStorage.getItem('branchId');
    if (branchId != null) {
      return branchId;
    } else {
      return '1';
    }
  }
  // get user branch id
  public setUserbranch(branchId): TokenStorageService {
    sessionStorage.setItem('branchId', branchId);
    return this;
  }

  // set user branch code
  public setUserbranchCode(branchCode): TokenStorageService {
    sessionStorage.setItem('branchCode', branchCode);
    return this;
  }

  // get user branch code
  public getUserBranchCode(): string {
    return sessionStorage.getItem('branchCode');
  }

   // set user branch name
   public setUserbranchName(branchName): TokenStorageService {
    sessionStorage.setItem('branchName', branchName);
    return this;
  }

  // get user branch name
  public getUserBranchName(): string {
    return sessionStorage.getItem('branchName');
  }



  public getAccess(routeDetails: string) {
    let modulesData: UserModules[] = this.getUserModules();
    let i = 0;
    let found = 0;
    modulesData.forEach(data => {
      for (i = 0; i < data.userSubmoduleList.length; i++) {
        if (routeDetails.toLowerCase() === data.userSubmoduleList[i].submoduleUrl.toLowerCase()) {
          this.setCurrentModuleReadFlag(data.userSubmoduleList[i].readFlag);
          this.setCurrentModuleWriteFlag(data.userSubmoduleList[i].writeFlag);
          this.setCurrentModuleUpdateFlag(data.userSubmoduleList[i].updateFlag);
          found = 1;
          break;
        }
      }
    });
    if (found === 0) {
      this._router.navigate(['/login']);
    }
  }

  // broad cast msg api
  public getBroadCastMsg(): Observable<BroadCastMsg[]> {
    const url = this._constants.GET_BROAD_CAST_MSG;
    return (this._client.get<BroadCastMsg[]>(url));
  }
}
