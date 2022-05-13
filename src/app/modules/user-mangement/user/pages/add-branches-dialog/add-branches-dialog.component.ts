import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatPaginator, MatSort} from '@angular/material';
import { Branches } from '../../models/branches.model';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  templateUrl: './add-branches-dialog.component.html',
  styleUrls: ['./add-branches-dialog.component.scss']
})
export class AddBranchesDialogComponent implements OnInit, AfterViewInit {
  dialogType: string;
  branchSearchBy = -1;
  searchByName = 'NAME';
  allBranches: Branches[] = [];
  allFilteredBranches: Branches[] = [];
  createFormGroup: FormGroup;
  criteriaValue;
  resultTable = false;
  searchOptions = [{id: -1, name: 'NAME'}];
  constructor(private _userService: UserService,
              public _toastr: ToastrService,
              private _spinner: NgxSpinnerService) { }
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['select', 'branchCode'
    , 'branchName'];

  dataSource: MatTableDataSource<Branches> = new MatTableDataSource();
  selection = new SelectionModel<Branches>(true, []);
  showError = true;
  showForCriteriaSearch = false;

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

  checkboxLabel(row?: Branches): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  loadData() {
    this._spinner.show();
    this._userService.getAllBranchTypes().subscribe(
      response => {
        response.data.forEach(
          data => {
            if (data.branchType != null && (data.branchType.includes('AREA') || data.branchType.includes('REGION'))) {
              this.searchOptions = [...this.searchOptions, { id: data.id, name: data.branchType }];
            }
          });
        this._spinner.hide();
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

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  initForm() {
    this.createFormGroup = new FormGroup({
      searchValueFC: new FormControl(''),
    });
  }

  AddUserPrevBranch() {
    this.selection.selected.forEach(
      selectedBranch => {});
}

// to show 3 characters are mandatory.
onKeyup(searchValLength: number ) {
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
      } else {
        this.resultTable = true;
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
