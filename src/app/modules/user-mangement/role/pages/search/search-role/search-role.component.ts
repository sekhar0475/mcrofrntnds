import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Role } from '../../../models/role.model';
import { RoleService } from '../../../services/role.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TokenStorageService } from '../../../../../login/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-search-role',
  templateUrl: './search-role.component.html',
  styleUrls: ['./search-role.component.scss']
})
export class SearchRoleComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['roleName'
    , 'desc'
    , 'effectiveDt'
    , 'expDt'
    , 'status'
    , 'actions'];
  dataSource: MatTableDataSource<Role> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  greetings;
  userName;
  writeAccess = false;
  editAccess = false;
  constructor(private _roleService: RoleService,
    private _tokenStorage: TokenStorageService,
    private _router: Router,
    public _toastr: ToastrService,
    private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.setPermissions();
    this.setGreetings();
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // set the permissions
  setPermissions() {
    // set the user access
    const path = this._router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y') {
      this.writeAccess = true;
      this.editAccess = true;
      return;
    } else if (this._tokenStorage.getCurrentModuleUpdateFlag() != null && this._tokenStorage.getCurrentModuleUpdateFlag() === 'Y') {
      this.editAccess = true;
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
      this.editAccess = false;
    }
  }

  // load Data while form loading
  loadData() {
    this._spinner.show();
    this._roleService.getRoles(-1).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.ngAfterViewInit();
      },
      error => {
        this._spinner.hide();
        console.log(error);
        if (error.error != null && error.error.errorCode != null) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }
  // navigate to edit role page
  gotoCreate(roleId) {
    this._router.navigate(['user-management/roles/createRole', roleId]);
  }
  // navigate to view
  gotoView(roleId: number) {
    this._router.navigate(['user-management/roles/viewRole', roleId]);
  }

  // search filter
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

  // Set Greetings
  setGreetings() {
    const today = new Date();
    const curHr = today.getHours();
    this._tokenStorage.getCurrentUserName().subscribe(
      response => {
        this.userName = response.toUpperCase();
      });
    if (curHr < 12) {
      this.greetings = 'Good Morning';
    } else if (curHr < 18) {
      this.greetings = 'Good Afternoon';
    } else {
      this.greetings = 'Good Evening';
    }
  }

}
