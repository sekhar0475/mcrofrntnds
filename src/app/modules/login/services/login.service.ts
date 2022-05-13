import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { TokenStorageService } from './token-storage.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
    private constants: ConstantsService,
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
  ) {
  }

  getCurrentUserValue(): Observable<string> {
    return this.tokenStorage.getCurrentUser();
  }

  login(usernameVal: string, passwordVal: string) {
      const payload = {username : usernameVal, password : passwordVal };
      const url = `${this.constants.LOGIN_API}`;
      return this.http.post<any>(url , payload)
      .pipe(map(responseData => {
        this.tokenStorage
          .setAccessToken(responseData.accessToken)
          .setCurrentUser(usernameVal)
          .setCurrentUserName(responseData.billingUserName)
          .setUserbranch(responseData.branchId)
          .setUserbranchCode(responseData.branchCode)
          .setUserbranchName(responseData.branchName);
        return responseData;
      }));
  }

  logout() {
    this.tokenStorage.clear();
  }

  getUserModules(id: string) {
    const formData = new FormData();
    formData.append('userId', id);
    const url = this.constants.USER_MODULE_API;
    return this.http
            .get < any > (url + id)
            .pipe(
                map(res => res)
            );
  }

}
