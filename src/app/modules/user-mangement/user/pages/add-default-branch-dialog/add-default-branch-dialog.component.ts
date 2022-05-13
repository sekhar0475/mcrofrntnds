import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Branches } from '../../models/branches.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  templateUrl: './add-default-branch-dialog.component.html',
  styleUrls: ['./add-default-branch-dialog.component.scss']
})
export class AddDefaultBranchDialogComponent implements OnInit, AfterViewInit {
  branchSearchBy = -1;
  searchByName = 'NAME';
  allBranches: Branches[] = [];
  allFilteredBranches: Branches[] = [];
  createFormGroup: FormGroup;
  criteriaValue;
  showError = true;
  showForCriteriaSearch = false;
  searchOptions = [{ id: -1, name: 'NAME' }];
  constructor(private _userService: UserService,
    public _toastr: ToastrService,
    private _spinner: NgxSpinnerService) { }

  displayedColumns: string[] = ['select', 'branchCode', 'branchName'];
  dataSource: MatTableDataSource<Branches> = new MatTableDataSource();
  selection = new SelectionModel<Branches>(false, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Branches): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  ngOnInit() {
    this.loadData();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this._spinner.show();
    this._userService.getAllBranchTypes().subscribe(
      response => {
        this._spinner.hide();
        response.data.forEach(
          data => {
            if (data.branchType != null && (data.branchType.includes('AREA') || data.branchType.includes('REGION'))) {
              this.searchOptions = [...this.searchOptions, { id: data.id, name: data.branchType }];
            }
          });
      },
      error => {
        this._spinner.hide();
        if (error.error != null && error.error.errorMessage) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else if (error.error != null) {
          this._toastr.warning(error.error);
        } else {
          this._toastr.warning(error.message);
        }
      });
  }

  AddUserDefBranch() {
    this.selection.selected.forEach(
      selectedBranch => { });
  }

  // to show 3 characters are mandatory.
  onKeyup(searchValLength: number) {
    if (searchValLength < 3) {
      this.showError = true;
    } else {
      this.showError = false;
    }
  }
  // set search by name
  setSearchByName(searchBy) {
    this.searchByName = searchBy.name;
    if ('NAME' === this.searchByName) {
      this.showForCriteriaSearch = false;
    } else {
      this.showForCriteriaSearch = true;
      this.showError = false;
      this.dataSource = new MatTableDataSource();
      this.criteriaValue = null;
      // invoke api
      this._spinner.show();
      this._userService.getBranchByType(this.branchSearchBy).subscribe(
        response => {
          this._spinner.hide();
          this.allFilteredBranches = response.data;
          let i = 0;
          for (i = 0; i < this.allFilteredBranches.length; i++) {
            if (this.allFilteredBranches[i].status === 0) {
              this.allFilteredBranches.splice(i, 1);
            }
          }
          if (this.allFilteredBranches.length === 0) {
            this._toastr.warning('No data found for the given search criteria');
          }
        },
        error => {
          this._spinner.hide();
          if (error.error != null && error.error.errorMessage) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else if (error.error != null) {
            this._toastr.warning(error.error);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
    }
  }
  onchange(searchVal) {
    this.criteriaValue = searchVal.value;
  }

  findByRegion() {
    this._spinner.show();
    this._userService.getBranchBySearchCritera(this.searchByName, this.criteriaValue).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource = new MatTableDataSource(response.data);
        this.ngAfterViewInit();
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('No data found for the given search criteria');
        }
      },
      error => {
        this._spinner.hide();
        if (error.error != null && error.error.errorMessage) {
          this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
        } else if (error.error != null) {
          this._toastr.warning(error.error);
        } else {
          this._toastr.warning(error.message);
        }
      }
    );
  }

  onClickGo() {
    if ('NAME' === this.searchByName) {
      this._spinner.show();
      this._userService.getWildCardBranchName(this.criteriaValue).subscribe(
        response => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response.data);
          this.ngAfterViewInit();
        },
        error => {
          this._spinner.hide();
          if (error.error != null && error.error.errorMessage) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else if (error.error != null) {
            this._toastr.warning(error.error);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
    }
  }
}
