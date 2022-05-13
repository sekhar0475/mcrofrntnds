import { Component, Inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Customer } from '../../../models/customer';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-credit-customer-search',
  templateUrl: './credit-customer-search.component.html',
  styleUrls: ['./credit-customer-search.component.scss']
})
export class CreditCustomerSearchComponent implements OnInit, AfterViewInit  {

  displayedColumns: string[] = ['select', 'customerName', 'billingLevel','billingLevelValue','aliasName'];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialogRef: MatDialogRef<CreditCustomerSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public customerList: Customer[]) {
      this.dataSource = new MatTableDataSource(this.customerList);
    }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

    ngOnInit() {
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
