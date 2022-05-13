import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserRoleAssignments } from 'src/app/modules/user-mangement/user/models/user-role-assignments.model';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Users } from '../../models/users.model';
import { MatDialog} from '@angular/material/dialog';
import { UserDto } from '../../models/user-dto.model';
import { UserRoleDto } from '../../models/user-role-dto.model';
import { UserBranchAssignments } from '../../models/user-branch-assignments.model';
import { UserBranchDto } from '../../models/user-branch-dto.model';
import { AlertService } from 'src/app/shared/modules/alert';
import { Department } from '../../models/department.model';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {
  createFormGroup: FormGroup;
  editMode = false;
  defaultBranchId: number;
  defaultBranchName: string;
  defaultBranchAddress: string;
  isRoleIdExist: boolean;
  departmentList: Department[] = [];
  userDto: UserDto;
  userRoleDto: UserRoleDto;
  errorMessage: Array<string>;
  userRoleAssignments: UserRoleAssignments[];
  userBranchAssignments: UserBranchAssignments[];

  userRolesDataSource: MatTableDataSource<UserRoleDto> = new MatTableDataSource();
  userBranchessDataSource: MatTableDataSource<UserBranchDto> = new MatTableDataSource();

  displayedBranchesColumns: string[] = ['branchName', 'type', 'address', 'effectiveDt', 'expiryDt'];
  displayedColumns: string[] = ['roleName', 'description', 'effectiveDt', 'expDt'];

  users: Users = {userMasterId: -1,
    userId: null,
    username: null,
    departmentId: null,
    departmentName: null,
    status: null,
    mobile: null,
    email: null,
    expDt: null};

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private _lookupService: LookupService,
    private _spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setPermissions();
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      userIdFC: new FormControl('', [Validators.required]),
      userNameFC: new FormControl('', [Validators.required]),
      mobileFC: new FormControl('', [Validators.required]),
      emailFC: new FormControl('', [Validators.email]),
      departmentFC: new FormControl('', [Validators.required]),
      expiryDateFC: new FormControl('', [])
    });
  }

  handleError(error) {
    this.alertService.error(error.error.errorMessage);
  }

  loadData() {
    const id = this.route.snapshot.params.id;
    if (id != -1) {
      this.editMode = true;
      this._spinner.show();
      this.userService.getUserById(id).subscribe(response => {
        this.users = response;
        this.userService.getAllUserRolesById(id).subscribe(response => {
          this.userRolesDataSource = new MatTableDataSource(response);
          this.userService.getDefBranchesByUserMasterId(id).subscribe(
            response => {
              this.defaultBranchId = response.branchId;
              this.defaultBranchName = response.branchName;
              this.defaultBranchAddress = response.address;
              this.userService.getPrevBranchesByUserMasterId(id).subscribe(
                response => {
                  this._spinner.hide();
                  this.userBranchessDataSource = new MatTableDataSource(response);
                }, error => {
                  this._spinner.hide();
                  this.handleError(error);
                });
          },
          error => {
            this._spinner.hide();
            this.handleError(error); });
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        });
      },
        error => {
          this._spinner.hide();
          this.handleError(error); });
    } else {
      this.editMode = false;
      this.users = {userMasterId: -1,
        userId: null,
        username: null,
        departmentId: null,
        departmentName: null,
        status: null,
        mobile: null,
        email: null,
        expDt: null};
      this._spinner.show();
      this.userService.getAllUserRolesById(id).subscribe(
        response => {
          this._spinner.hide();
          this.userRolesDataSource = new MatTableDataSource(response);
        }, error => {
          this._spinner.hide();
          this.handleError(error);
        }
      );
    }
  }

  gotoSearch() {
    this.router.navigate(['user-management/users']);
  }

  userIdPresent(userId) {
    if (userId === -1) {
      return true;
    } else {
      return false;
    }
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
   }


}
