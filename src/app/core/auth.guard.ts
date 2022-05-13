import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { LoginService } from '../modules/login/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let currentUser;
      this.loginService.getCurrentUserValue().subscribe(
      response => {
        currentUser = response;
      }
    );
    console.log('currentUser '+currentUser);
      if (currentUser) {
      // authorised so return true
        return true;
      }

    // not logged in so redirect to login page with the return url
      this.router.navigate(['/login']);
      return false;
  }


}

