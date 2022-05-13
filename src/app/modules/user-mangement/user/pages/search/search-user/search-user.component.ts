import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Users } from '../../../models/users.model';
import { UserService } from '../../../services/user.service';
import { TokenStorageService } from '../../../../../login/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss']
})
export class SearchUserComponent implements OnInit, AfterViewInit {
  searchFormGroup: FormGroup;
  displayedColumns: string[] = ['userId'
    , 'username'
    , 'mobile'
    , 'email'
    , 'status'
    , 'details'];

  dataSource: MatTableDataSource<Users> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  greetings;
  userName;
  writeAccess = true;
  editAccess = true;
  constructor(private _userService: UserService,
              private _router: Router,
              private _tokenStorage: TokenStorageService,
              public _toastr: ToastrService,
              private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.setPermissions();
    this.setGreetings();
    this.initForm();
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm() {
    this.searchFormGroup = new FormGroup({});
  }

  loadData() {
    this._spinner.show();
    this._userService.getAllUsers().subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error => {
        this._spinner.hide();
        this._toastr.warning(error.message);
      }
    );
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addUser() {
    this._router.navigate(['user-management/users/create-user', -1]);
  }

  gotoEdit(userMasterId: number) {
    this._router.navigate(['user-management/users/create-user', userMasterId]);
  }

  gotoView(userMasterId: number) {
    this._router.navigate(['user-management/users/view-user', userMasterId]);
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

}
