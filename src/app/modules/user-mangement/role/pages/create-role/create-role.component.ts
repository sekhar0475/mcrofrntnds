import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, Validators, FormGroup, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { MatTableDataSource } from '@angular/material/table';
import { Role } from '../../models/role.model';
import { Module } from '../../models/module.model';
import { SubModule } from '../../models/subModule.model';
import { MatPaginator } from '@angular/material/paginator';
import { RolePermissions } from '../../models/permissions.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS },
    { provide: DatePipe }
  ]
})
export class CreateRoleComponent implements OnInit, AfterViewInit {
  createFormGroup: FormGroup;
  dataSource: MatTableDataSource<RolePermissions> = new MatTableDataSource();
  displayedColumns: string[] = [
    'moduleName'
    , 'subModuleName'
    , 'readFlag'
    , 'writeFlag'
    , 'updateFlag'
    , 'startDt'
    , 'expDt'
    , 'delete'
  ];

  role: Role = {
    roleId: -1,
    roleName: '',
    desc: '',
    status: 'NEW',
    expDt: null,
    effectiveDt: new Date(),
    rolePermissionDTOList: null
  };
  permissionDetails: RolePermissions[] = [];
  moduleList: Module[];
  subModuleMasterList: SubModule[] = [];
  todayDate: Date = new Date();
  expDate: Date = null;

  editable: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private _route: ActivatedRoute
    , private _router: Router
    , private _roleService: RoleService
    , public _dialogs: MatDialog
    , public _toastr: ToastrService
    , private _spinner: NgxSpinnerService
    , private _tokenStorage: TokenStorageService
    , public datePipe: DatePipe) {
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
    this.setPermissions();
  }

  // set the expiry date
  setMinExpiryDate(effectiveDt: Date) {
    if (effectiveDt != null && effectiveDt > this.todayDate) {
      return effectiveDt;
    } else {
      return this.todayDate;
    }
  }

  setPermissions() {
    // set user permissions
    const path = this._router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (!(this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y')) {
      this._router.navigate(['/login']);
    }
  }

  // to convert date to for start date and expiry date comparision
  convert(str) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }
  initForm() {
    this.createFormGroup = new FormGroup({
      roleNameFC: new FormControl('', [Validators.required]),
      descriptionFC: new FormControl('', [Validators.required]),
      expiryDateFC: new FormControl(''),
      startDateFC: new FormControl('', [Validators.required]),
      statusFC: new FormControl('')
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.createFormGroup.controls;
  }
  // Load data while page loading
  loadData() {
    const id = this._route.snapshot.params.id;
    // get module list LOV values
    this._spinner.show();
    this._roleService.getAllModules().subscribe(
      response => {
        console.log(response);
        this.moduleList = response;
        this.moduleList.forEach(data => {
          let i = 0;
          for (i = 0; i < data.subModuleMasterList.length; i++) {
            this.subModuleMasterList.push({
              moduleId: data.subModuleMasterList[i].moduleId,
              submoduleId: data.subModuleMasterList[i].submoduleId,
              submoduleName: data.subModuleMasterList[i].submoduleName,
              submoduleUrl: data.subModuleMasterList[i].submoduleUrl,
            });
          }
        });
        // if role Id is available, fetch the details from the backend.
        if (id != -1) {
          this._roleService.getRoles(id).subscribe(
            response => {
              this.role = response[0];
              const datePipeVal = new DatePipe('en-US');
              if (this.role.effectiveDt != null) {
                const dt = datePipeVal.transform(this.role.effectiveDt, 'dd-MMM-yyyy');
                this.role.effectiveDt = new Date(dt);
                console.log('Effective Date inside Subscribe: ', this.role.effectiveDt);
                let tDate = new Date(datePipeVal.transform(new Date(), 'dd-MMM-yyyy'))
                if (this.role.effectiveDt < tDate) {
                  this.editable = true;
                  this.createFormGroup.controls.startDateFC.disable();
                }
              }
              if (this.role.expDt != null) {
                const dt = datePipeVal.transform(this.role.expDt, 'dd-MMM-yyyy');
                this.role.expDt = new Date(dt);
              }
              this.role.rolePermissionDTOList.forEach(data => {
                if (data.effectiveDt != null) {
                  const dt = datePipeVal.transform(data.effectiveDt, 'dd-MMM-yyyy');
                  data.effectiveDt = new Date(dt);
                }
                if (data.expDt != null) {
                  const dt = datePipeVal.transform(data.expDt, 'dd-MMM-yyyy');
                  data.expDt = new Date(dt);
                }
              });
              this.dataSource = new MatTableDataSource(this.role.rolePermissionDTOList);
              // this.createFormGroup.controls.roleNameFC.setErrors(null);
              this.createFormGroup.controls.roleNameFC.disable();
              this._spinner.hide();
            },
            error => {
              this._spinner.hide();
              if (error.error != null) {
                this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
              } else {
                this._toastr.warning(error.message);
              }
            }
          );
        } else {
          this._spinner.hide();
        }
      },
      error => {
        this._spinner.hide();
        console.log(error);
        if (error.error != null) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }
  // change in readFlag
  readFlagChange(row: RolePermissions, value: MatCheckboxChange) {
    if (value.checked) {
      row.readFlag = 'Y';
      row.writeFlag = 'N';
      row.updFlag = 'N';
    } else {
      row.readFlag = 'N';
    }
  }

  // change in readFlag
  writeFlagChange(row: RolePermissions, value: MatCheckboxChange) {
    if (value.checked) {
      row.writeFlag = 'Y';
      row.updFlag = 'N';
    } else {
      row.writeFlag = 'N';
    }
  }

  // change in updateFlag
  updFlagChange(row: RolePermissions, value: MatCheckboxChange) {
    if (value.checked) {
      row.updFlag = 'Y';
      row.writeFlag = 'N';
    } else {
      row.updFlag = 'N';
    }
  }

  // to check valid permission start date
  validPermiStartDate(permStartDt: Date) {
    if (this.convert(permStartDt) < this.convert(this.todayDate)) {
      return true;
    } else {
      return false;
    }
  }
  // validate permissions
  permissionValidation() {
    let i = 0;
    let _nullColsFound = 0; // flag to check if any mandatory columns are not entered
    let _noPermissions = 0; // flag to check if no permissions(Read/Write) are not entered
    let _noExpPermissionData = 0; // flag to check for backdated permission expiry
    let _noEffDtPermissionData = 0; // flag to check backdated start date in permission
    let _noEffDtLessPermission = 0; // flag to check for backdated permission start date
    this.permissionDetails = [];
    this.dataSource.data.forEach(data => {
      this.permissionDetails.push({
        roleId: this.role.roleId,
        moduleAssignId: data.moduleAssignId,
        moduleId: data.moduleId,
        submoduleId: data.submoduleId,
        readFlag: data.readFlag,
        writeFlag: data.writeFlag,
        updFlag: data.updFlag,
        expDt: data.expDt,
        effectiveDt: data.effectiveDt
      });
    }
    );
    // temporary array
    const _valueArr = this.permissionDetails.map(function (item) { return item.submoduleId; });
    // flag to check if duplicate exists
    const _isDuplicate = _valueArr.some(function (item, idx) { return _valueArr.indexOf(item) !== idx; });

    for (i = 0; i < this.permissionDetails.length; i++) {
      // to check expDate validation
      // const expDt = this.permissionDetails[i].effectiveDt == null ? this.todayDate : this.permissionDetails[i].effectiveDt;
      this.expDate = this.permissionDetails[i].effectiveDt;
      console.log('this.permissionDetails[i].effectiveDt');
      console.log(this.expDate);
      if (this.permissionDetails[i].submoduleId == null) {
        _nullColsFound = 1;
      }
      if (!(this.permissionDetails[i].readFlag == 'N' ? null : this.permissionDetails[i].readFlag) &&
        !(this.permissionDetails[i].writeFlag == 'N' ? null : this.permissionDetails[i].writeFlag)) {
        _noPermissions = 1;
      }
      if (this.permissionDetails[i].expDt !== null && this.convert(this.permissionDetails[i].expDt) <
        this.convert(this.permissionDetails[i].effectiveDt)) {
        _noExpPermissionData = 1;
      }
      if (this.permissionDetails[i].effectiveDt == null) {
        _noEffDtPermissionData = 1;
      }
      if (this.permissionDetails[i].effectiveDt !== null &&
        this.convert(this.permissionDetails[i].effectiveDt) < this.convert(this.todayDate) && !this.validStartDate()) {
        _noEffDtLessPermission = 1;
      }
      if (this.permissionDetails[i].effectiveDt !== null &&
        this.convert(this.permissionDetails[i].effectiveDt) < this.convert(this.todayDate) && !this.validStartDate()) {
        _noEffDtLessPermission = 1;
      }
      if (this.permissionDetails[i].effectiveDt !== null &&
        this.convert(this.permissionDetails[i].effectiveDt) < this.convert(this.role.effectiveDt)
      ) {
        _noEffDtLessPermission = 1;
      }
      if (this.role.expDt !== null &&
        (this.convert(this.permissionDetails[i].expDt) > this.convert(this.role.expDt))) {
        _noExpPermissionData = 1;
      }
      if (this.role.expDt !== null &&
        (this.convert(this.permissionDetails[i].effectiveDt) > this.convert(this.role.expDt))) {
        _noEffDtLessPermission = 1;
      }
    }

    if (_isDuplicate) {
      this._toastr.warning('Duplicate Submodules Assigned');
    }
    if (_nullColsFound > 0) {
      this._toastr.warning('Module and Submodules are mandatory');
    }
    if (_noPermissions > 0) {
      this._toastr.warning('Either Read Or Write access is mandatory');
    }
    if (this.permissionDetails.length === 0) {
      this._toastr.warning('Atleast one permission is mandatory.');
    }
    if (_noExpPermissionData > 0) {
      this._toastr.warning('Permission Entered Expiry Date is Invalid. Kindly enter a valid Expiry Date');
    }
    if (_noEffDtPermissionData > 0) {
      this._toastr.warning('Permission Start Date Can not be Empty');
    }
    if (_noEffDtLessPermission > 0) {
      this._toastr.warning('Permission Entered Start Date is Invalid. Kindly enter a valid Start Date');
    }
  }
  // post data into the database
  submit() {
    // validate the data
    this.permissionValidation();
    // post the data into database
    if (!this._toastr.currentlyActive) {
      console.log(this.role);
      this.role = ({
        roleId: this.role.roleId,
        roleName: this.role.roleName,
        desc: this.role.desc,
        status: this.role.status,
        expDt: this.role.expDt,
        effectiveDt: this.role.effectiveDt,
        rolePermissionDTOList: this.permissionDetails
      });
      this._spinner.show();
      this._roleService.postRoleData(this.role).subscribe
        (
          success => {
            this._spinner.hide();
            console.log(success);
            this.gotoSearch();
          }, error => {
            this._spinner.hide();
            console.log(error);
            if (error.error != null) {
              if (error.error.errorCode === 'handled_exception') {
                this._toastr.warning((error.error.errorMessage));
              } else {
                this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
              }
            } else {
              this._toastr.warning(error.message);
            }
          });
    }
  }
  // To Add new Permissions
  addPermission() {
    this.dataSource.data.unshift({
      moduleAssignId: null,
      roleId: this.role.roleId,
      moduleId: null,
      submoduleId: null,
      readFlag: 'Y',
      writeFlag: null,
      updFlag: null,
      expDt: null,
      effectiveDt: this.convert(this.role.effectiveDt) < this.convert(this.todayDate) ?
        this.todayDate : this.role.effectiveDt
    });
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
  }
  // To remove Permissions
  deletePermission(moduleAssignId, index) {
    this.dataSource.data.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
  }
  // navigate to search page.
  gotoSearch() {
    this._router.navigate(['user-management/roles']);
  }
  // on clicking back button.
  back() {
    // confirm whether to proceed or not.
    const dialogRef = this._dialogs.open(ConfirmationDialogComponent, {
      data: 'Changes made on the Page will be lost. Please confirm if you want to proceed?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gotoSearch();
      } else {
        // do nothing.
      }
    });
  }
  onKeyDown($event): void {
    let charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.ctrlKey && charCode === 's') {
      // Action on Ctrl + S
      $event.preventDefault();
      if (this.createFormGroup.valid) {
        this.submit();
      }
    }
  }

  validStartDate() {
    if (this.convert(this.role.effectiveDt) < this.convert(this.todayDate)) {
      return true;
    } else {
      return false;
    }
  }


  onModuleChange(index) {
    const moduleAssignLine = this.dataSource.data[index];
    const filteredList = this.subModuleMasterList.filter(
      data =>
        data.moduleId === moduleAssignLine.moduleId
    );

    if (filteredList.length == 1) {
      moduleAssignLine.submoduleId = filteredList[0].submoduleId;
    }
    else {
      moduleAssignLine.submoduleId = null;
    }
    this.dataSource.data[index] = moduleAssignLine;
  }
}
