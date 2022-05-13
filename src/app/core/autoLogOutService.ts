import { NavigationEnd, Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { LoginService } from '../modules/login/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../modules/login/services/token-storage.service';
import { LogoutCountdownComponent } from '../shared/components/logout-countdown/logout-countdown.component';
import { MatDialog } from '@angular/material';

const MINUTES_UNITL_AUTO_LOGOUT = 30 // in Minutes
const CHECK_INTERVALL = 60 * 1000 // 1 minute
const STORE_KEY = 'lastAction';

@Injectable({ providedIn: 'root' })
export class AutoLogoutService {

  isPopUpOpen: Boolean = false

  constructor(
    private loginService: LoginService,
    private router: Router,
    private ngZone: NgZone,
    private _toastr: ToastrService,
    private tokenStorage: TokenStorageService,
    private _dialog: MatDialog,
  ) {
    this.check();
    this.initListener();
    this.initInterval();
    localStorage.setItem(STORE_KEY,Date.now().toString());
  }

  // to get present value in localStorage .
  public getLastAction() {
    return parseInt(localStorage.getItem(STORE_KEY));
  }

  // set if any changes occurs
 public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  // Listener to reset the last action value
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      console.log();
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if (event.url != '/login') {
            this.reset();
          }
        }
      });
    });
  }

  // check internal for every 1 minute
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.check();
      }, CHECK_INTERVALL);
    })
  }

  reset() {
    this.isPopUpOpen = false;
    this.setLastAction(Date.now());
  }

  // check in time left
  check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    // if(this.isPopUpOpen) {
    //   timeleft = this.getLastAction() + 5000;
    // }
    const diff = timeleft - now;
    const isTimeout = diff < 0;
    // less than 2 minutes and greater than 1 minute      
    if (diff < 60 * 2 * 1000 && diff > 60 * 1 * 1000) {
      this._toastr.warning("Session will expire in 2 Minutes")
    }

    // less than 1 minutes 
  if (diff < 60 * 1 * 1000 && diff > 0) {
      this._toastr.warning("Session will expire in 1 Minutes")
    }


  let currentUser;
    this.tokenStorage.getCurrentUser().subscribe(
      (response) => {
        currentUser = response;
      }
    )

    // auto log out

  this.ngZone.run(() => {
      if (isTimeout && currentUser) {
        console.log(`Auto Logout ${MINUTES_UNITL_AUTO_LOGOUT} Minutes Completed`);
        this.logOut();
      }
    });
  }

 logOut() {
    localStorage.clear();
    localStorage.clear();
    this.loginService.logout();
    this._toastr.warning('Session Time Out.');
    this.router.navigate(['/login']);
   }
}
