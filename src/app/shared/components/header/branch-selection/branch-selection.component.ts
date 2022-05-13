import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BranchService } from './services/branch-service';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-branch-selection',
  templateUrl: './branch-selection.component.html',
  styleUrls: ['./branch-selection.component.scss']
})
export class BranchSelectionComponent implements OnInit, AfterViewInit {

  constructor(private _branchService: BranchService,
              private _tokenStorage: TokenStorageService,
              public _toastr: ToastrService,
              private _spinner: NgxSpinnerService) { }

  displayedColumns: string[] = ['select', 'branchCode'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // get user id
    let currentUser;
    this._tokenStorage.getCurrentUser().subscribe(
      response => {
        currentUser = response;
        console.log(response);
      }
    );
    this._spinner.show();
    this._branchService.getUserBranches(currentUser).subscribe(
      response => {
        console.log('User branches' ,response);
        this.dataSource.data = response;
        this._spinner.hide();
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

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // search filter
  public applyFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

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
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }


}
