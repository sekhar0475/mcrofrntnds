import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomerLedgerService } from '../../customer-ledger/service/customer-ledger.service';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss']
})
export class CustomerDialogComponent implements OnInit {


  showError = true;
  displayedColumns: string[] = ['select', 'propelMsaCode', 'msaName', 'aliasName'];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
  selection = new SelectionModel<Customer>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(public _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _ledgerService: CustomerLedgerService) { }

  ngOnInit() {
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
  onKeyup(searchValLength: number) {
    if (searchValLength < 3) {
      this.showError = true;
    } else {
      this.showError = false;
    }
  }

  // on Go Button click
  onClickGo(searchValue) {
    this._spinner.show();
    this._ledgerService.getCustomerByName(searchValue).subscribe(
      response => {
        this.dataSource = new MatTableDataSource();
        this._spinner.hide();
        response.forEach(element => {
          element.billingInfo.forEach(billInfo => {
            this.dataSource.data.unshift({
              id: element.id,
              propelMsaCode: element.propelMsaCode,
              msaName: element.msaName,
              billConfigId: billInfo.billConfigId,
              aliasName: billInfo.aliasName
            });
          });
        });
        this.ngAfterViewInit();
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
  }

}
