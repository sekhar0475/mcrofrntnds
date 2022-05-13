import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from 'src/app/modules/login/services/login.service';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { BranchSelectionComponent } from './branch-selection/branch-selection.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidebarActiveStatus: EventEmitter<any> = new EventEmitter();

  userName:string;
  branchFC = new FormControl();
  filteredBranch: Observable<any[]>;
  branchName:string;

  constructor(private _loginService: LoginService,
    private _router: Router,
    public dialog: MatDialog,
    private _tokenStorage: TokenStorageService) {
  }

  ngOnInit() {
    this.setBillingUserName();
    this.branchName = this._tokenStorage.getUserBranchCode();
  }

  toggleSideBar() {
    this.sidebarActiveStatus.emit();
  }

  logout() {
    this._loginService.logout();
    this._router.navigate(['/login']);
  }

  // Set Billing User Name
  setBillingUserName() {
    const today = new Date();
    const curHr = today.getHours();
    this._tokenStorage.getCurrentUserName().subscribe(
      response => {
        this.userName = response.toUpperCase();
      });
  }

  openDialog() {
    const dialogRef = this.dialog.open(BranchSelectionComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.branchName = result[0].branchCode;
          console.log(result[0]);
          this._tokenStorage.setUserbranchCode(result[0].branchCode);
          this._tokenStorage.setUserbranchName(this.branchName);
          this._tokenStorage.setUserbranch(result[0].branchId);

          let currentUrl = this._router.url;
          if (currentUrl === '/dashboard') {
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._router.navigate([currentUrl]);
          } else {
            this._router.navigate(['/dashboard']);
          }
        }
      } else {
        // cancel clicked.
      }

    });
  }


}
