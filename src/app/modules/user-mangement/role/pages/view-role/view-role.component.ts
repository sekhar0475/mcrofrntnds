import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Role } from '../../models/role.model';
import { RolePermissions } from '../../models/permissions.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';

@Component({
  selector: 'app-view-role',
  templateUrl: './view-role.component.html',
  styleUrls: ['./view-role.component.scss']
})
export class ViewRoleComponent implements OnInit, AfterViewInit {

  dataSource: MatTableDataSource<RolePermissions> = new MatTableDataSource();
  displayedColumns: string[] = [
    'moduleName'
    , 'subModuleName'
    , 'readFlag'
    , 'writeFlag'
    , 'updateFlag'
    , 'effectiveDt'
    , 'expDt'
  ];
  role: Role;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private route: ActivatedRoute
    , private router: Router
    , private roleService: RoleService
    , private _spinner: NgxSpinnerService
    , private _tokenStorage: TokenStorageService
    , public _toastr: ToastrService) { }

  ngOnInit() {
    this.loadData();
    this.setPermissions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // set the permissions
  setPermissions() {
    // set the user access
    const path = this.router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
  }

  // get the data from the backend services
  loadData() {
    const id = this.route.snapshot.params.id;
    if (id != -1) {

      // get roles details
      this._spinner.show();
      this.roleService.getRoles(id).subscribe(
        response => {
          this._spinner.hide();
          this.role = response[0];
          this.dataSource = new MatTableDataSource(this.role.rolePermissionDTOList);
          this.ngAfterViewInit();
        },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
    }
  }

  // goto search page
  gotoSearch() {
    this.router.navigate(['user-management/roles']);
  }


}
