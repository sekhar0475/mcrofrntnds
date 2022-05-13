import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DocumentBranch } from '../../models/document-branch.model';
import { DocumentSearchUploadService } from '../../services/document-search-upload.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-document-branch',
  templateUrl: './document-branch.component.html',
  styleUrls: ['./document-branch.component.scss']
})
export class DocumentBranchComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'branchName'];
  docBranchList: DocumentBranch[] = [];
  dataSource = new MatTableDataSource(this.docBranchList);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor(
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<DocumentBranchComponent>,
    private _documentSearchUploadService: DocumentSearchUploadService) {
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    // data filter
    this.setBranchDetails();
    this.dataSource.filterPredicate = function (data: DocumentBranch, filter: string): boolean {
      return data.branchName.toLowerCase().includes(filter);
    };
  }

  // get branch details
  setBranchDetails() {
    this.docBranchList = [];
    this._spinner.show();
    this._documentSearchUploadService.getBranchDetails().subscribe(
      response => {
        console.log('branch fetched');
        console.log(response);
        this._spinner.hide();
        const respData = response;
        respData.forEach(element => {
          this.docBranchList.push({
            branchId: element.branchId,
            branchName: element.branchName,
            bankAccNumGeneral: element.bankAccNumGeneral,
            bankAccNumOffline: element.bankAccNumOffline,
            bankAccNumOnline: element.bankAccNumOnline
          }
          );
        });
        this.dataSource = new MatTableDataSource(this.docBranchList);
        this.ngAfterViewInit();
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  // errors function
  handleError(error: any) {
    if (error.error != null) {
      if (error.error.errorCode === 'handled_exception') {
        this._toastr.warning((error.error.errorMessage));
      } else {
        this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }
}

