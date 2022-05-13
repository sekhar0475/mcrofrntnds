import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomerLedgerService } from '../service/customer-ledger.service';

@Component({
  selector: 'app-customer-search-dialog',
  templateUrl: './customer-search-dialog.component.html',
  styleUrls: ['./customer-search-dialog.component.scss']
})
export class CustomerSearchDialogComponent implements OnInit {
  constructor(public _toastr: ToastrService,
              private _spinner: NgxSpinnerService,
              private _ledgerService: CustomerLedgerService) { }

  showError = true;
  displayedColumns: string[] = ['select', 'propelMsaCode', 'msaName'];
  dataSource: MatTableDataSource<CustomerDetails> = new MatTableDataSource();
  selection = new SelectionModel<CustomerDetails>(true, []);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  ngOnInit() {
  }

  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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

  checkboxLabel(row?: CustomerDetails): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }
  
  // to show 3 characters are mandatory.
  onKeyup(searchValLength: number ) {
    if (searchValLength < 3) {
    this.showError = true;
     } else {
      this.showError = false;
    }
  }

   // on Go Button click
   onClickGo(searchValue){
      this._spinner.show();
      this._ledgerService.getCustomerByName(searchValue).subscribe(
        response=>{
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.ngAfterViewInit();
        },
        error=>{
          this._spinner.hide();
          if (error.error != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }

      );
      }
}
