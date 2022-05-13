import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../modules/login/services/token-storage.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  brarerToken: any;
  constructor(private _tokenStorageService: TokenStorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentUser;
    this._tokenStorageService.getCurrentUser().subscribe(
      response => {
        currentUser = response;
      }
    );
    //
    if (currentUser) {
      this._tokenStorageService.getAccessToken().subscribe(response => {
        this.brarerToken = response;
      });
      //
      const branchId = this._tokenStorageService.getUserBranch();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.brarerToken}`,
          UserName: currentUser,
          BranchId: branchId
        }
      });
    }
    return next.handle(request);
  }
}
