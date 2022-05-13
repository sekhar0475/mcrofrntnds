import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserRoleAssignments } from 'src/app/modules/user-mangement/user/models/user-role-assignments.model';
import { FormControl, Validators, FormGroup, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Users } from '../../models/users.model';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../role/models/role.model';
import { AddRoleDialogComponent } from '../add-role-dialog/add-role-dialog.component';
import { UserDto } from '../../models/user-dto.model';
import { AddBranchesDialogComponent } from '../add-branches-dialog/add-branches-dialog.component';
import { UserRoleDto } from '../../models/user-role-dto.model';
import { UserBranchDto } from '../../models/user-branch-dto.model';
import { AddDefaultBranchDialogComponent } from '../add-default-branch-dialog/add-default-branch-dialog.component';
import { UserBranchAssignments } from '../../models/user-branch-assignments.model';
import { ErrorDialogComponent } from 'src/app/shared/components/error-dialog/error-dialog.component';
import { AdServiceDto } from '../../models/ad-service-dto.model';
import { Department } from '../../models/department.model';
import { Branches } from '../../models/branches.model';
import { DateAdapter, MAT_DATE_FORMATS, MatSort, MatAutocompleteTrigger } from '@angular/material';
import { mobileNumberValidator } from '../../services/user-validators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { LookupService } from 'src/app/shared/services/lookup-service/lookup-service.service';
import { DatePipe } from '@angular/common';


interface emailOptions {
  value: string;
}
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class CreateUserComponent implements OnInit, AfterViewInit {
  createFormGroup: FormGroup;
  adResponse: AdServiceDto;
  editMode = false;
  defaultBranchId: number;
  defaultBranchName: string;
  defaultBranchAddress: string;
  defaultBranchCode: string;
  isRoleIdExist: boolean;
  isBranchIdExist: boolean;
  isDefBranchIdExist: boolean;
  userDto: UserDto;
  userRoleDto: UserRoleDto;
  errorArr: string[] = [];
  departmentList: Department[] = [];
  userBranchDto: UserBranchDto[] = [];
  userBranchD: UserBranchDto;
  todayDate: Date = new Date();
  userRoleAssignments: UserRoleAssignments[] = [];
  userBranchAssignments: UserBranchAssignments[] = [];
  userRolesDataSource: MatTableDataSource<UserRoleDto> = new MatTableDataSource();
  userBranchessDataSource: MatTableDataSource<UserBranchDto> = new MatTableDataSource();
  displayedBranchesColumns: string[] = ['branchName', 'type', 'address', 'effectiveDt', 'expiryDt'];
  displayedColumns: string[] = ['roleName', 'description', 'effectiveDt', 'expDt'];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatAutocompleteTrigger, null) autocomplete: MatAutocompleteTrigger;

  users: Users = {
    userMasterId: -1,
    userId: null,
    username: null,
    departmentId: null,
    departmentName: null,
    status: null,
    mobile: null,
    email: null,
    expDt: null
  };
  emailList: emailOptions[] = [];

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private _tokenStorage: TokenStorageService,
    private toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _lookupService: LookupService) {
  }

  getMinDate(dateValue: Date): Date {
    if (dateValue) {
      return dateValue;
    } else {
      return new Date();
    }
  }

   // set the expiry date
   setMinExpiryDate(effectiveDt: Date) {
    if (effectiveDt != null && effectiveDt > this.todayDate) {
    return effectiveDt;
    } else {
    return this.todayDate;
    }
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setPermissions();
  }

  setPermissions() {
    const path = this.router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (!(this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y')) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    this.userRolesDataSource.sort = this.sort;
    this.userBranchessDataSource.sort = this.sort;
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      userIdFC: new FormControl('', [Validators.required], this.userValidator()),
      userNameFC: new FormControl('', [Validators.required]),
      mobileFC: new FormControl('', [Validators.required,
        mobileNumberValidator]),
      emailFC: new FormControl('', [Validators.email,
      Validators.required]),
      departmentFC: new FormControl('', [Validators.required]),
      expiryDateFC: new FormControl('')
    });
  }

  // open the autocomplete window on entering @
  onKeydown(e, email) {
    if (e.key == '@') {
      const emailId = email.value + '@safexpress.com';
      this.emailList = [{ value: emailId }];
    }
    this.autocomplete.openPanel();
  }

  userValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (control.value.length >= 3) {
        this._spinner.show();
        return this.userService.validateuser(control.value)
          .pipe(
            map(response => {
              this._spinner.hide();
              if (response.status === 'Failed') {
                return { userIdInvalid: true };
              }
            },
              error => {
                this._spinner.hide();
              })
          );
      }
    };
  }

  handleError(error) {
    if (error.error != null && error.error.errorMessage != null) {
      this.toastr.warning(error.error.errorMessage);
    } else {
      this.toastr.warning(error.message);
    }
  }

  loadData() {
    const id = this.route.snapshot.params.id;
    this._spinner.show();
    this._lookupService.getLookupValuesByType('USER_DEPT').subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.departmentList = [...this.departmentList, { departmentId: lkps.id, departmentName: lkps.lookupVal }];
          });
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
    if (id != -1) {
      const datePipeVal = new DatePipe('en-US');
      this.editMode = true;
      this.createFormGroup.controls.userIdFC.disable();
      this.userService.getUserById(id).subscribe(response => {
        this.users = response;
        if (this.users.expDt != null) {
          const dt = datePipeVal.transform(this.users.expDt, 'dd-MMM-yyyy');
          this.users.expDt = new Date(dt);
        }
      },
        error => { this.handleError(error); });
      this.userService.getAllUserRolesById(id).subscribe(response => {
        this.userRolesDataSource = new MatTableDataSource(response);
        this.userRolesDataSource.data.forEach(data => {
          if (data.effectiveDt != null) {
            const dt = datePipeVal.transform(data.effectiveDt, 'dd-MMM-yyyy');
            data.effectiveDt = new Date(dt);
          }
          if (data.expDt != null) {
            const dt = datePipeVal.transform(data.expDt, 'dd-MMM-yyyy');
            data.expDt = new Date(dt);
          }
        });
        this.ngAfterViewInit();
      }, error => { this.handleError(error); });
      this.userService.getDefBranchesByUserMasterId(id).subscribe(
        response => {
          this.defaultBranchId = response.branchId;
          this.defaultBranchName = response.branchName;
          this.defaultBranchCode = response.branchCode;
          this.defaultBranchAddress = response.address;
        },
        error => { this.handleError(error); });
      this.userService.getPrevBranchesByUserMasterId(id).subscribe(
        response => {
          this.userBranchessDataSource = new MatTableDataSource(response);
          this.userBranchessDataSource.data.forEach(data => {
            if (data.effectiveDt != null) {
              const dt = datePipeVal.transform(data.effectiveDt, 'dd-MMM-yyyy');
              data.effectiveDt = new Date(dt);
            }
            if (data.expDt != null) {
              const dt = datePipeVal.transform(data.expDt, 'dd-MMM-yyyy');
              data.expDt = new Date(dt);
            }
          });
          this.ngAfterViewInit();
        }, error => { this.handleError(error); });
    } else {
      this.editMode = false;
      this.users = {
        userMasterId: -1,
        userId: null,
        username: null,
        departmentId: null,
        departmentName: null,
        status: null,
        mobile: null,
        email: null,
        expDt: null
      };
      this.userService.getAllUserRolesById(id).subscribe(
        response => {
          this.userRolesDataSource = new MatTableDataSource(response);
        }, error => { this.handleError(error); }
      );
    }
  }
  userIdPresent(userId) {
    if (userId === -1) {
      return true;
    } else {
      return false;
    }
  }

  validate() {
    if (this.errorArr.length > 0) {
      const dialogRef = this.dialog.open(ErrorDialogComponent, {
        data: this.errorArr
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.errorArr = [];
        }
      });
    }
  }


  saveData() {

    // atleast one defualt branch is mandatory.
    if (this.defaultBranchId == null) {
      this.toastr.warning('Please select default branch');
    }
    if (!this.toastr.currentlyActive) {
      this.userDto = null;
      this.userRoleAssignments = [];
      this.userBranchAssignments = [];
      this.userRolesDataSource.data.forEach(data => this.userRoleAssignments.push(
        {
          userRoleAssignId: null,
          roleId: data.roleId,
          userMasterId: null,
          effectiveDt: data.effectiveDt,
          expDt: data.expDt
        }));

      this.userBranchAssignments.push({
        userBrAssignId: null,
        brId: this.defaultBranchId,
        brName: this.defaultBranchName,
        brCode: this.defaultBranchCode,
        type: 'DEFAULT',
        userMasterId: null,
        address: this.defaultBranchAddress,
        effectiveDt: null,
        expDt: null
      });

      this.userBranchessDataSource.data.forEach
        (data => this.userBranchAssignments.push(
          {
            userBrAssignId: null,
            brId: data.branchId,
            brName: data.branchName,
            brCode: data.branchCode,
            type: 'PREVILEDGE',
            userMasterId: null,
            address: data.address,
            effectiveDt: data.effectiveDt,
            expDt: data.expDt
          }));

      this.userDto = {
        userMasterId: this.users.userMasterId,
        userId: this.users.userId,
        username: this.users.username,
        mobile: this.users.mobile,
        email: this.users.email,
        departmentId: this.users.departmentId,
        departmentName: this.users.departmentName,
        expDt: this.users.expDt,
        status: null,
        userRoleAssignmentList: this.userRoleAssignments,
        userBranchAssignmentList: this.userBranchAssignments,
        crBy: null,
        crDt: null,
        updDt: null,
        updBy: null,
        attr1: null,
        attr2: null,
        attr3: null,
        attr4: null,
        attr5: null,
      };
      console.log(this.userDto);
      this.userService.postUserData(this.userDto).subscribe
        (
          success => {
            this.gotoSearch();
          }, error => { this.handleError(error); });
      this.errorArr = [];
    }

  }

  gotoSearch() {
    this.router.navigate(['user-management/users']);
  }

  // on clicking reset button
  resetPage() {
    this.loadData();
  }

  validateRoles(role: Role[]) {
    role.forEach(selectedRole => {
      this.userRolesDataSource.data.forEach(existRole => {
        if (existRole.roleId === selectedRole.roleId) {
          this.isRoleIdExist = true;
          this.toastr.error('Role Name ' + selectedRole.roleName + ' is already assigned to user');
        }
      });
    });
  }

  validateBranches(branch: Branches[]) {
    if (branch != null && branch.length > 0) {
      branch.forEach(selectedBranch => {
        this.userBranchessDataSource.data.forEach(existBranch => {
          if (existBranch.branchId === selectedBranch.branchId) {
            this.isBranchIdExist = true;
            this.toastr.error('Branch Name ' + selectedBranch.branchName + ' is already assigned as priviliged branch to user');
          }
        });
        if (selectedBranch.branchId === this.defaultBranchId) {
          this.isBranchIdExist = true;
          this.toastr.error('Branch Name ' + selectedBranch.branchName + ' is already assigned as Default branch to user');
        }
      });
    }
  }

  addRolesToUser(role: any) {
    role.forEach(selectedRole => {
      this.userRoleDto = {
        userRoleAssignId: null,
        roleId: selectedRole.roleId,
        roleName: selectedRole.roleName,
        description: selectedRole.description,
        status: null,
        effectiveDt: new Date(),
        expDt: null
      };
      this.userRolesDataSource.data.push(this.userRoleDto);
      this.userRolesDataSource.filter = '';
    });
  }

  openAddRolesDialog() {
    this.isRoleIdExist = false;
    const dialogRef = this.dialog.open(AddRoleDialogComponent, {
     width: '550px'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.validateRoles(result);
      if (this.isRoleIdExist) {
        this.validate();
      } else {
        this.addRolesToUser(result);
      }
    }, error => { this.handleError(error); });
  }

  openAddDefaultBrDialog() {
    this.isBranchIdExist = false;
    const dialogRef = this.dialog.open(AddDefaultBranchDialogComponent, {
      width: '550px'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.validateBranches(result);
      if (this.isBranchIdExist) {
        this.validate();
      } else {
        if (result[0] != null) {
          this.defaultBranchId = result[0].branchId;
          this.defaultBranchName = result[0].branchName;
          this.defaultBranchCode = result[0].branchCode;
          this.defaultBranchAddress = result[0].address;
        }
      }
    }, error => { this.handleError(error); });
  }

  openAddBranchesDialog() {
    this.isBranchIdExist = false;
    const dialogRef = this.dialog.open(AddBranchesDialogComponent, {
      width: '550px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.validateBranches(result);
      if (this.isBranchIdExist) {
        this.validate();
      } else {
        if (result != null && result != '') {
          result.forEach(selectedBrs => {
            this.userBranchD = {
              userBrAssignId: null,
              branchId: selectedBrs.branchId,
              branchName: selectedBrs.branchName,
              branchCode: selectedBrs.branchCode,
              type: null,
              address: selectedBrs.address,
              effectiveDt: new Date(),
              expDt: null
            };
            this.userBranchessDataSource.data.push(this.userBranchD);
            this.userBranchessDataSource.filter = '';
          }, error => { this.handleError(error); });
        }
      }
    });
  }

  // set the department name on changing department.
  setDeptName(department) {
    this.users.departmentName = department.departmentName;
  }

  onKeyDown($event): void {
    let charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.ctrlKey && charCode === 's') {
        // Action on Ctrl + S
        $event.preventDefault();
        if(this.createFormGroup.valid) {
          this.saveData();
        }
    } 
  }
}
