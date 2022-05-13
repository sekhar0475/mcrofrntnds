import { Component , OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatTableDataSource, MatDialog, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { SearchBillData } from '../../models/search-bill.model';
import { UpdateBillBranchService } from '../../services/update-bill-branch.service';
import { DialogChangeBranchComponent } from './dialog-branch/dialog-change-branch.component';
import { BillBranchData } from '../../models/update-bill-branch.model';
import { ErrorMsg } from 'src/app/shared/models/global-error.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-update-bill-branch-result',
  templateUrl: './update-bill-branch-result.component.html',
  styleUrls: ['./update-bill-branch-result.component.scss']
})
export class UpdateBillBranchResultComponent implements OnChanges {

  displayedColumns: string[] = [
      'select'
    , 'billNumber'
    , 'blngLevelValue'
    , 'customerName'
    , 'submsnBrName'
    , 'colBrName'
    , 'altrBrName'];
  @Input() searchData: SearchBillData;
  errorMessage: ErrorMsg;
  dataSource: MatTableDataSource<BillBranchData> = new MatTableDataSource();
  selection = new SelectionModel<BillBranchData>(true, []);
  @Output() clearSearchValues: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private _dialog: MatDialog,
    private _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _updateBillBranchService: UpdateBillBranchService) { }


  ngOnChanges(changes: SimpleChanges) {
    this.loadData();
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

  checkboxLabel(row?: BillBranchData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  loadData() {
    const billNumber = this.searchData.billNumbers;
    // const billNumbers = this.searchData.billNumbers.split(',').map(item => item.trim());
    // console.log(this.searchData.billNumbers.split(',').map(item => item.trim()));
    const billType = this.searchData.billType;
    this._spinner.show();
    this._updateBillBranchService.getBillBranches(billNumber , billType).subscribe(
      response => {
        this._spinner.hide();
        this.dataSource.data = null;
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.sort = this.sort;
        if (this.dataSource.data.length === 0) {
          this._toastr.warning('No Data Found For' + ' ' + billNumber);
          this.pickSearchData(false);
        }
      },
      error => {
        this._spinner.hide();
        this.handleError(error);
        this.pickSearchData(false);
      });
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


  // errors function
  handleStringError(error: any) {
    this.errorMessage = JSON.parse(error.error);
    console.log(this.errorMessage);
    if (this.errorMessage != null) {
      if (this.errorMessage.errorCode === 'handled_exception') {
        this._toastr.warning((this.errorMessage.errorMessage));
      } else {
        this._toastr.warning(this.errorMessage.errorMessage + ' Details: ' + this.errorMessage.errorDetails);
      }
    } else {
      this._toastr.warning(error.message);
    }
  }


  // to clear the search component values
  pickSearchData(clearSearch: boolean) {
    this.clearSearchValues.emit(clearSearch);
  }

  // for document branch search
  changeBranch() {
    const billType = this.searchData.billType;
    const dialogRef = this._dialog.open(DialogChangeBranchComponent, {
      data: { selectedBillBranch: this.selection.selected, billType },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      } else {
        this.loadData();
        this.selection.clear();
      }
      // back drop clicked.
      dialogRef.backdropClick().subscribe(() => {
        // Close the dialog
        dialogRef.close();
      });
    });
  }

}
